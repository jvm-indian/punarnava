import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleTier, PickupItem, PickupRequest } from '../../types';
import { UBER_VEHICLE_OPTIONS } from '../../data/mockData';
import { PickupLiveTracker } from './PickupLiveTracker';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  Radio,
  Compass,
  ArrowRight,
  ShieldCheck,
  Scale,
  RotateCcw,
} from 'lucide-react';

export const UberStyleBooking: React.FC<{
  onOpenCalculator: () => void;
}> = ({ onOpenCalculator }) => {
  const {
    uberDispatch,
    nearbyDrivers,
    requestUberKabadiwala,
    cancelUberRequest,
    scrapItems,
    currentUser,
    pickups,
  } = useApp();

  const [selectedTier, setSelectedTier] = useState<VehicleTier>('cargo_erickshaw');
  const [doorstepAddress, setDoorstepAddress] = useState('Flat 402, Oakwood Heights, Sector 4');
  const [selectedMaterials, setSelectedMaterials] = useState<PickupItem[]>([
    { itemId: 'paper-news', itemName: 'Newspaper (Raddi)', category: 'Paper', estimatedWeight: 15, ratePerUnit: 15 },
    { itemId: 'plastic-pet', itemName: 'PET Bottles', category: 'Plastics', estimatedWeight: 5, ratePerUnit: 18 },
  ]);

  const activeDriver = nearbyDrivers.find((d) => d.vehicleTier === selectedTier) || nearbyDrivers[0];

  const handleRequestNow = () => {
    requestUberKabadiwala(selectedTier, selectedMaterials, doorstepAddress);
  };

  const calculateQuickEstimate = () => {
    return selectedMaterials.reduce((acc, it) => acc + it.estimatedWeight * it.ratePerUnit, 0);
  };

  // If driver has matched or is arriving, render the full Uber Google Maps live tracking view
  if (uberDispatch.status === 'matched' || uberDispatch.status === 'arriving') {
    const matchedPickup: PickupRequest = pickups.find((p) => p.status === 'in_progress') || {
      id: 'PKP-UBER-884',
      customerName: currentUser?.name || 'Citizen User',
      customerPhone: currentUser?.phone || '+91 98700 12345',
      customerAddress: doorstepAddress,
      landmark: 'Opposite Metro Pillar 112',
      city: 'New Delhi / NCR',
      lat: 28.535514,
      lng: 77.391026,
      items: selectedMaterials,
      preferredSlot: 'Instant On-Demand (~4 mins)',
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'in_progress' as const,
      otp: '4829',
      collectorId: activeDriver?.id,
      collectorName: activeDriver?.name,
      collectorPhone: activeDriver?.phone,
      collectorVehicle: `${activeDriver?.vehicleType} (${activeDriver?.vehiclePlate})`,
      collectorRating: activeDriver?.rating,
      totalEstimatedValue: calculateQuickEstimate(),
      createdAt: new Date().toISOString(),
    };

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 block animate-ping" />
            <div>
              <h3 className="font-extrabold text-white text-base">
                Kabadiwala Dispatched & En Route!
              </h3>
              <p className="text-xs text-slate-400">
                Live Google Maps tracking active for your doorstep collection in Sector 4
              </p>
            </div>
          </div>
          <button
            onClick={cancelUberRequest}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            Cancel Request
          </button>
        </div>

        <PickupLiveTracker
          pickup={matchedPickup}
          onClose={cancelUberRequest}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Uber-Style Top Radar & Fleet Status Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-400 block animate-ping" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 absolute inset-0" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <span>On-Demand Doorstep Scrap Dispatch</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Uber For Kabadiwalas
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {nearbyDrivers.length} verified cargo rickshaws & carts roaming in Sector 4 right now
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Doorstep Location:</span>
          <span className="text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            Sector 4, New Delhi / NCR
          </span>
        </div>
      </div>

      {/* Main Grid: Live Interactive Radar Map + Uber Ride Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Map Visualizer (7 cols) */}
        <div className="lg:col-span-7 relative h-[420px] rounded-3xl bg-slate-950 border-2 border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col justify-between p-5">
          {/* Map Grid Pattern */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
          
          {/* Simulated Roads & Landmarks */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-0 right-0 h-4 bg-emerald-500/40 -translate-y-1/2 rotate-12" />
            <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-emerald-500/40 -rotate-6" />
            <div className="absolute top-0 bottom-0 right-1/4 w-3 bg-emerald-500/40 rotate-15" />
          </div>

          {/* Map Top Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span className="font-mono text-slate-300">Live GPS Radar • 1.2 km Radius</span>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-emerald-400">
              Avg Arrival: ~4 Mins
            </div>
          </div>

          {/* User's Center Location Pin (Doorstep) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 animate-ping absolute -inset-2" />
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/50">
                <MapPin className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
            </div>
            <div className="mt-2 bg-slate-900/95 border border-emerald-500/50 px-2.5 py-1 rounded-xl text-[11px] font-bold text-white shadow-xl whitespace-nowrap">
              Your Doorstep (Sector 4)
            </div>
          </div>

          {/* Moving Nearby Kabadiwala Drivers (Uber Fleet) */}
          {nearbyDrivers.map((driver) => {
            const isSelected = selectedTier === driver.vehicleTier;
            return (
              <div
                key={driver.id}
                onClick={() => setSelectedTier(driver.vehicleTier)}
                className={`absolute z-20 cursor-pointer transition-all hover:scale-110 flex flex-col items-center ${
                  driver.vehicleTier === 'cargo_erickshaw'
                    ? 'top-[28%] left-[28%]'
                    : driver.vehicleTier === 'eco_cart'
                    ? 'bottom-[25%] left-[32%]'
                    : 'top-[35%] right-[22%]'
                }`}
              >
                <div
                  className={`px-2.5 py-1 rounded-xl border font-mono text-xs flex items-center gap-1.5 shadow-xl ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/50'
                      : 'bg-slate-900/90 text-slate-200 border-slate-700'
                  }`}
                >
                  <span className="text-base">
                    {driver.vehicleTier === 'cargo_erickshaw' ? '🛺' : driver.vehicleTier === 'eco_cart' ? '🚲' : '🚚'}
                  </span>
                  <span className="font-bold">{driver.etaMinutes}m</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-slate-950/80 px-1 rounded mt-0.5">
                  {driver.name.split(' ')[0]} ({driver.distanceMeters}m)
                </span>
              </div>
            );
          })}

          {/* Map Footer Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800">
            <span className="flex items-center gap-1">
              <span className="text-sm">🛺</span> PUNARNAVA Go (E-Rickshaw)
            </span>
            <span className="flex items-center gap-1">
              <span className="text-sm">🚲</span> PUNARNAVA Eco (Cycle Cart)
            </span>
            <span className="flex items-center gap-1">
              <span className="text-sm">🚚</span> PUNARNAVA Max (Electric Tempo)
            </span>
          </div>
        </div>

        {/* Uber Request Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          {uberDispatch.status === 'searching' ? (
            /* Searching Radar View */
            <div className="py-12 text-center space-y-4 my-auto">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-teal-400 animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mt-2">
                  <Navigation className="w-10 h-10 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="font-extrabold text-white text-lg">Finding Nearest Kabadiwala...</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Broadcasting your dry waste collection request to cargo rickshaws within 1 km
                </p>
              </div>
              <button
                onClick={cancelUberRequest}
                className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                Cancel Request
              </button>
            </div>
          ) : (
            /* Vehicle Tier Selection & Request Form */
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Pickup Doorstep Address:
                </span>
                <input
                  type="text"
                  value={doorstepAddress}
                  onChange={(e) => setDoorstepAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Vehicle Options like Uber */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Select Kabadiwala Vehicle Type:
                </span>
                {UBER_VEHICLE_OPTIONS.map((opt) => {
                  const isSelected = selectedTier === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedTier(opt.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{opt.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs text-white">{opt.name}</h5>
                            <span className="text-[10px] font-mono text-emerald-400">~{opt.etaMinutes} min</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{opt.tagline}</p>
                          <span className="text-[10px] text-slate-500 block font-mono">{opt.capacity}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-300 block">
                          Instant Payout
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Spot Rate</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimate Preview */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Cashout:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ~₹{calculateQuickEstimate()} (Est. 20 kg scrap)
                  </span>
                </div>
                <button
                  onClick={onOpenCalculator}
                  className="text-emerald-400 hover:text-emerald-300 text-xs underline font-medium"
                >
                  Adjust Items
                </button>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleRequestNow}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <span>REQUEST {selectedTier === 'cargo_erickshaw' ? 'PUNARNAVA GO' : selectedTier === 'eco_cart' ? 'PUNARNAVA ECO' : 'PUNARNAVA MAX'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
