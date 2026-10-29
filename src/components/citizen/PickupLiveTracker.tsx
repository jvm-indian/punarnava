import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  Compass,
  Scale,
  Sparkles,
  Send,
  X,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertCircle,
  Truck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PickupRequest } from '../../types';

// API Key access - prioritizing VITE_GOOGLE_MAPS_API_KEY from environment or user-provided key
const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyB-y2da-jXaSFhM3kz0d_Vjvr_WCyxuKTw';

// Doorstep target coordinates (Sector 4, New Delhi / NCR)
export const DOORSTEP_LOCATION = { lat: 28.535514, lng: 77.391026 };
export const HUB_LOCATION = { lat: 28.5705, lng: 77.326 };

// Dense simulated route coordinates from Sector 18 Aggregation Hub to Doorstep in Sector 4
export const ROUTE_WAYPOINTS: google.maps.LatLngLiteral[] = [
  { lat: 28.5705, lng: 77.326 },
  { lat: 28.5682, lng: 77.3295 },
  { lat: 28.5658, lng: 77.334 },
  { lat: 28.5635, lng: 77.3385 },
  { lat: 28.5612, lng: 77.343 },
  { lat: 28.5585, lng: 77.348 },
  { lat: 28.5555, lng: 77.3535 },
  { lat: 28.5528, lng: 77.3585 },
  { lat: 28.55, lng: 77.3635 },
  { lat: 28.5472, lng: 77.3685 },
  { lat: 28.5445, lng: 77.3735 },
  { lat: 28.542, lng: 77.378 },
  { lat: 28.5395, lng: 77.3825 },
  { lat: 28.538, lng: 77.3855 },
  { lat: 28.5365, lng: 77.3885 },
  { lat: 28.535514, lng: 77.391026 },
];

/**
 * Route Polyline Drawer using native google.maps.Polyline with useMap hook
 * compliant with @vis.gl/react-google-maps patterns
 */
const RoutePolylineRenderer: React.FC<{
  path: google.maps.LatLngLiteral[];
  currentProgressIndex: number;
}> = ({ path, currentProgressIndex }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const traveledPolylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    // Ahead Route (Emerald Green)
    polylineRef.current = new google.maps.Polyline({
      path,
      strokeColor: '#10b981', // emerald-500
      strokeOpacity: 0.9,
      strokeWeight: 6,
      map,
    });

    // Traveled Route (Slate / Dark)
    traveledPolylineRef.current = new google.maps.Polyline({
      path: path.slice(0, currentProgressIndex + 1),
      strokeColor: '#64748b', // slate-500
      strokeOpacity: 0.7,
      strokeWeight: 5,
      map,
    });

    return () => {
      polylineRef.current?.setMap(null);
      traveledPolylineRef.current?.setMap(null);
    };
  }, [map]);

  // Update paths on index movement
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setPath(path);
    }
    if (traveledPolylineRef.current) {
      traveledPolylineRef.current.setPath(path.slice(0, Math.max(1, currentProgressIndex + 1)));
    }
  }, [path, currentProgressIndex]);

  return null;
};

/**
 * Auto-fit bounds on initial map load
 */
const AutoBoundsAdjuster: React.FC<{
  points: google.maps.LatLngLiteral[];
}> = ({ points }) => {
  const map = useMap();
  const adjustedRef = useRef(false);

  useEffect(() => {
    if (!map || !points.length || adjustedRef.current) return;
    if (typeof google === 'undefined' || !google.maps) return;

    const bounds = new google.maps.LatLngBounds();
    points.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, { top: 70, right: 60, bottom: 100, left: 60 });
    adjustedRef.current = true;
  }, [map, points]);

  return null;
};

interface PickupLiveTrackerProps {
  pickup: PickupRequest;
  onClose?: () => void;
  onCompletePickup?: () => void;
}

export const PickupLiveTracker: React.FC<PickupLiveTrackerProps> = ({
  pickup,
  onClose,
  onCompletePickup,
}) => {
  // Vehicle movement simulation state along waypoints
  const [waypointIndex, setWaypointIndex] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [tripStage, setTripStage] = useState<'dispatched' | 'en_route' | 'arrived' | 'weighing' | 'completed'>('en_route');
  
  // Interactive UI modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'driver' | 'user'; text: string; time: string }>>([
    {
      sender: 'driver',
      text: 'Namaste ji! I have loaded the Bluetooth digital scale and am proceeding to Sector 4 in my EV cargo rickshaw. 🛺',
      time: 'Just now',
    },
  ]);
  const [inputChat, setInputChat] = useState('');
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);

  // Current vehicle location
  const currentVehiclePos = ROUTE_WAYPOINTS[waypointIndex] || ROUTE_WAYPOINTS[0];
  const nextPos = ROUTE_WAYPOINTS[Math.min(waypointIndex + 1, ROUTE_WAYPOINTS.length - 1)];

  // Heading calculation for rotating the vehicle icon
  const vehicleHeading = useMemo(() => {
    if (!currentVehiclePos || !nextPos) return 0;
    const dy = nextPos.lat - currentVehiclePos.lat;
    const dx = nextPos.lng - currentVehiclePos.lng;
    const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
    return angle;
  }, [currentVehiclePos, nextPos]);

  // Distance remaining and ETA
  const totalWaypoints = ROUTE_WAYPOINTS.length;
  const remainingWaypoints = totalWaypoints - 1 - waypointIndex;
  const distanceKm = Math.max(0.1, Number((remainingWaypoints * 0.12).toFixed(1)));
  const etaMinutes = Math.max(1, Math.round(remainingWaypoints * 0.35));

  // Simulation timer
  useEffect(() => {
    if (!isPlaying || tripStage === 'arrived' || tripStage === 'completed') return;

    const intervalTime = Math.max(250, 1600 / simSpeed);
    const timer = setInterval(() => {
      setWaypointIndex((prev) => {
        if (prev < ROUTE_WAYPOINTS.length - 1) {
          const next = prev + 1;
          if (next === ROUTE_WAYPOINTS.length - 1) {
            setTripStage('arrived');
            setIsPlaying(false);
            confetti({ particleCount: 50, spread: 55, origin: { y: 0.6 } });
          }
          return next;
        } else {
          setTripStage('arrived');
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, simSpeed, tripStage]);

  // Auto trigger "arrived" when at the last point
  useEffect(() => {
    if (waypointIndex >= ROUTE_WAYPOINTS.length - 1 && tripStage === 'en_route') {
      setTripStage('arrived');
    }
  }, [waypointIndex, tripStage]);

  const handleSendMessage = () => {
    if (!inputChat.trim()) return;
    const newMsg = {
      sender: 'user' as const,
      text: inputChat.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setInputChat('');

    // Simulated driver automated reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: 'Understood ji! Reaching in 2 minutes. Please keep scrap near the door.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const handleCannedReply = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const restartSimulation = () => {
    setWaypointIndex(0);
    setTripStage('en_route');
    setIsPlaying(true);
  };

  const simulateDoorstepArrival = () => {
    setWaypointIndex(ROUTE_WAYPOINTS.length - 1);
    setTripStage('arrived');
    setIsPlaying(false);
    confetti({ particleCount: 60, spread: 60 });
  };

  return (
    <div className="relative rounded-3xl bg-slate-950 border border-emerald-500/30 overflow-hidden shadow-2xl">
      {/* Top Uber-Style Floating Navigation Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: ETA & Ride Status Badge */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/40 shadow-xl flex items-center gap-3">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-400 block animate-ping" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 absolute inset-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {tripStage === 'arrived'
                  ? 'Kabadiwala Arrived at Doorstep!'
                  : tripStage === 'weighing'
                  ? 'Smart Scale Weighing in Progress'
                  : 'Kabadiwala En Route'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live GPS
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              {tripStage === 'arrived' ? (
                <span className="text-emerald-400 font-bold">Ring bell or meet downstairs</span>
              ) : (
                <>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    ~{etaMinutes} min away
                  </span>
                  <span className="text-slate-500">•</span>
                  <span>{distanceKm} km</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">Moderate Traffic</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Close / Simulation Controls */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => setSimSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors"
            title="Simulation Speed"
          >
            {simSpeed}x
          </button>
          <button
            onClick={restartSimulation}
            title="Replay Route"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {tripStage !== 'arrived' && (
            <button
              onClick={simulateDoorstepArrival}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-500/20"
            >
              <span>Jump to Arrived</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Live Tracking"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Google Maps Viewport */}
      <div className="w-full h-[480px] md:h-[540px] relative">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={DOORSTEP_LOCATION}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {/* Auto-fit map bounds */}
            <AutoBoundsAdjuster points={ROUTE_WAYPOINTS} />

            {/* Route Polyline (Between Depot, Vehicle, and Doorstep) */}
            <RoutePolylineRenderer
              path={ROUTE_WAYPOINTS}
              currentProgressIndex={waypointIndex}
            />

            {/* 1. Doorstep Destination Marker (Sector 4, Citizen Residence) */}
            <AdvancedMarker
              position={DOORSTEP_LOCATION}
              title={`Your Doorstep: ${pickup.customerAddress}`}
            >
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/25 border-2 border-emerald-400 animate-ping absolute -inset-2" />
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-2xl border-2 border-white">
                    <MapPin className="w-6 h-6 fill-slate-950 text-slate-950" />
                  </div>
                </div>
                <div className="mt-1.5 px-3 py-1 rounded-xl bg-slate-950/95 border border-emerald-500/60 shadow-2xl text-[11px] font-extrabold text-white flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Your Doorstep</span>
                </div>
              </div>
            </AdvancedMarker>

            {/* 2. Moving Kabadiwala Vehicle Marker (Uber-style Animated Auto/Rickshaw) */}
            <AdvancedMarker
              position={currentVehiclePos}
              title="PUNARNAVA Verified Collector Partner"
            >
              <div className="flex flex-col items-center cursor-pointer group">
                {/* Vehicle Pill Header */}
                <div className="mb-1.5 px-2.5 py-1 rounded-xl bg-slate-950/95 border border-emerald-400 shadow-2xl text-[10px] font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-emerald-400 font-mono">
                    {pickup.collectorVehicle?.split('(')[0] || '🛺 EV Rickshaw'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-emerald-300">{pickup.collectorVehicle?.match(/\((.*?)\)/)?.[1] || 'MP-04-EA-2024'}</span>
                </div>

                {/* Animated Vehicle Icon with Heading Rotation */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/30 border border-emerald-400/80 animate-pulse absolute -inset-2" />
                  <div
                    style={{ transform: `rotate(${vehicleHeading}deg)` }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-2xl transition-transform duration-300"
                  >
                    <span className="text-2xl filter drop-shadow">🛺</span>
                  </div>
                  {/* Driver avatar mini badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-950 overflow-hidden shadow">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Driver"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </AdvancedMarker>

            {/* 3. Aggregation Depot Hub Origin Marker */}
            <AdvancedMarker
              position={HUB_LOCATION}
              title="PUNARNAVA Central Aggregation Hub"
            >
              <div className="flex flex-col items-center opacity-85 hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center shadow-lg text-xs font-bold">
                  🏬
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[9px] font-mono text-slate-400">
                  Sector 18 Hub
                </div>
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </div>

      {/* Uber-Style Bottom Floating Sheet / Ride Information Drawer */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-t border-slate-800 space-y-4">
        {/* Toggle Collapse Chevron */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
              🛺
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                <span>{pickup.collectorName || 'Ramesh Kumar'}</span>
                <button
                  onClick={() => setIsBadgeModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>CPCB Verified</span>
                </button>
              </h4>
              <p className="text-xs text-slate-400">
                {pickup.collectorVehicle || 'Mahindra Treo Zor EV Auto (MP-04-EA-2024)'} • <span className="text-amber-400 font-bold">★ 4.9</span> (1,420 pickups)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSheetExpanded((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={isSheetExpanded ? 'Collapse Drawer' : 'Expand Drawer'}
            >
              {isSheetExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible details section */}
        {isSheetExpanded && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            {/* Trip Step Progress Bar (Uber Style) */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold font-mono">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex flex-col items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Confirmed</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex flex-col items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Dispatched</span>
              </div>
              <div
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tripStage === 'arrived' || tripStage === 'weighing' || tripStage === 'completed'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40 animate-pulse'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. En Route</span>
              </div>
              <div
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  tripStage === 'arrived' || tripStage === 'weighing' || tripStage === 'completed'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>4. Doorstep Scale</span>
              </div>
            </div>

            {/* Quick Contact & Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Call Collector */}
              <a
                href={`tel:${pickup.collectorPhone || '+919876543210'}`}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call {pickup.collectorName?.split(' ')[0] || 'Kabadiwala'}</span>
              </a>

              {/* Message Collector */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat / Instructions</span>
              </button>

              {/* View Verified ID Badge */}
              <button
                onClick={() => setIsBadgeModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify ID & Scale Cert</span>
              </button>
            </div>

            {/* Doorstep Verification OTP and Bluetooth Scale Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OTP Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-inner flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Doorstep Verification Code
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Share this 4-digit code ONLY after verifying weighing
                  </span>
                </div>
                <div className="font-mono text-3xl font-black text-emerald-300 bg-emerald-950/80 px-4 py-1.5 rounded-xl border border-emerald-500/40 shadow-lg tracking-widest">
                  {pickup.otp || '4829'}
                </div>
              </div>

              {/* Bluetooth Scale Status */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      PUNARNAVA BT Smart Scale
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      BLE ID: SCALE-PRO-8812 • Legal Metrology Certified
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  Ready
                </span>
              </div>
            </div>

            {/* Scrap Items Manifest */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">Items Scheduled:</span>
                <div className="flex flex-wrap gap-1.5">
                  {pickup.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium"
                    >
                      {it.itemName} (~{it.estimatedWeight}kg)
                    </span>
                  ))}
                </div>
              </div>
              <div className="font-mono text-emerald-400 font-bold">
                Est. Payout: ₹{pickup.totalEstimatedValue || 380} (via UPI)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* In-App Uber Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Chat Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Collector"
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>{pickup.collectorName || 'Ramesh Kumar'}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {pickup.collectorVehicle || 'EV Cargo Rickshaw MP-04-EA-2024'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Canned Responses */}
            <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => handleCannedReply("I'm waiting at the main gate")}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              >
                Waiting at gate
              </button>
              <button
                onClick={() => handleCannedReply('Please ring bell for Flat 402')}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              >
                Ring Flat 402 bell
              </button>
              <button
                onClick={() => handleCannedReply('Heavy cardboard ready downstairs')}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              >
                Heavy scrap ready
              </button>
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type instructions for Kabadiwala..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner KYC & Digital Badging Modal */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Verified Partner Badge</h3>
              </div>
              <button
                onClick={() => setIsBadgeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="Collector"
                className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-emerald-400 shadow-xl"
              />
              <div>
                <h4 className="font-extrabold text-white text-lg">{pickup.collectorName || 'Ramesh Kumar'}</h4>
                <p className="text-xs text-emerald-400 font-mono font-semibold">
                  Partner ID: PN-KBD-8492
                </p>
                <p className="text-xs text-slate-400">PUNARNAVA Certified Circular Economy Partner</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Police Verification:</span>
                <span className="text-emerald-400 font-semibold font-mono">✅ Passed & Active</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">CPCB Waste Permit:</span>
                <span className="text-emerald-400 font-semibold font-mono">CPCB/DL/2024/0991</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Vehicle Registration:</span>
                <span className="text-slate-200 font-mono font-semibold">MP-04-EA-2024</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Weighing Scale Calibrated:</span>
                <span className="text-emerald-400 font-semibold font-mono">Yes (BLE Tamper-Proof)</span>
              </div>
            </div>

            <button
              onClick={() => setIsBadgeModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
