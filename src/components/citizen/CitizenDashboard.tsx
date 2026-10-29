import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UberStyleBooking } from './UberStyleBooking';
import { EnvironmentalImpactChart } from './EnvironmentalImpactChart';
import {
  Calendar,
  Calculator,
  ShieldCheck,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
  Sparkles,
  Droplets,
  Wind,
  Trees,
  Award,
  ChevronRight,
  TrendingUp,
  CreditCard,
  QrCode,
  Star,
  MessageSquare,
  ThumbsUp,
  Download,
  Share2,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { PickupLiveTracker } from './PickupLiveTracker';
import { PickupRatingModal } from './PickupRatingModal';
import { CollectorReviewsDrawer } from './CollectorReviewsDrawer';
import { DigitalWalletCard } from './DigitalWalletCard';
import { UpiWithdrawModal } from './UpiWithdrawModal';
import { WalletPassbookModal } from './WalletPassbookModal';

export const CitizenDashboard: React.FC<{
  onOpenSchedule: () => void;
  onOpenCalculator: () => void;
}> = ({ onOpenSchedule, onOpenCalculator }) => {
  const {
    pickups,
    activePickup,
    scrapItems,
    collector,
    uberDispatch,
    t,
    ratingModalPickup,
    openRatingModal,
    closeRatingModal,
    walletBalance,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    isPassbookOpen,
    setIsPassbookOpen,
    showToast,
  } = useApp();
  const [showCertificate, setShowCertificate] = useState(false);
  const [showCollectorReviews, setShowCollectorReviews] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'live_tracker' | 'uber_dispatch'>('live_tracker');

  // Pick the most relevant active pickup (or recent one)
  const currentPickup = activePickup || pickups[0];

  // Default live pickup object to ensure live Google Maps tracking is always interactive
  const liveTrackingPickup = currentPickup || {
    id: 'PKP-LIVE-884',
    customerName: 'Citizen Resident',
    customerPhone: '+91 98700 12345',
    customerAddress: 'Flat 402, Oakwood Heights, Sector 4, New Delhi / NCR',
    landmark: 'Opposite Metro Pillar 112',
    city: 'New Delhi / NCR',
    lat: 28.535514,
    lng: 77.391026,
    items: [
      { itemId: 'paper-news', itemName: 'Newspaper (Raddi)', category: 'Paper' as const, estimatedWeight: 18, ratePerUnit: 15 },
      { itemId: 'plastic-pet', itemName: 'PET Bottles (Clean)', category: 'Plastics' as const, estimatedWeight: 6, ratePerUnit: 18 },
      { itemId: 'metal-copper', itemName: 'Copper Wire & Brass', category: 'Metals' as const, estimatedWeight: 2, ratePerUnit: 780 },
    ],
    preferredSlot: 'Instant On-Demand (~4 mins)',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'in_progress' as const,
    otp: '4829',
    collectorId: collector.id,
    collectorName: collector.name,
    collectorPhone: collector.phone,
    collectorVehicle: `${collector.vehicleType} (${collector.vehiclePlate})`,
    collectorRating: collector.rating,
    totalEstimatedValue: 1938,
    createdAt: new Date().toISOString(),
  };

  // Calculate user aggregate circular impact from completed pickups
  const completedPickups = pickups.filter((p) => p.status === 'completed');
  const unratedCompletedPickup = completedPickups.find((p) => !p.rating);
  const totalWaterSaved = pickups.reduce((acc, p) => acc + (p.impact?.waterSavedLiters || 0), 0);
  const totalCo2Avoided = pickups.reduce((acc, p) => acc + (p.impact?.co2SavedKg || 0), 0);
  const totalTreesPreserved = pickups.reduce((acc, p) => acc + (p.impact?.treesPreserved || 0), 0);
  const totalEarnedCash = completedPickups.reduce((acc, p) => acc + (p.finalPayout || p.totalEstimatedValue || 0), 0);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top View Selector: Live Tracking Map vs On-Demand Dispatcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewTab('live_tracker')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeViewTab === 'live_tracker'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <MapPin className="w-4 h-4" />
            <span>Live Ride Tracking (Google Maps)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/20 uppercase font-black">
              Uber Mode
            </span>
          </button>

          <button
            onClick={() => setActiveViewTab('uber_dispatch')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeViewTab === 'uber_dispatch'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛺</span>
            <span>Request Scrap Pickup</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 px-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Vehicle: {collector.vehiclePlate}</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">Sector 4, New Delhi</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeViewTab === 'live_tracker' ? (
        <PickupLiveTracker pickup={liveTrackingPickup} />
      ) : (
        <UberStyleBooking onOpenCalculator={onOpenCalculator} />
      )}

      {/* Hero Welcome & Quick Booking Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Doorstep Dry Waste Monetization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Turn Scrap into Instant UPI Cash & Save the Planet
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Transparent, refinery-backed scrap rates. Certified collectors arrive at your doorstep equipped with Bluetooth-verified scales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenSchedule}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Schedule Free Doorstep Pickup</span>
            </button>
            <button
              onClick={onOpenCalculator}
              className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Calculate Value</span>
            </button>
          </div>
        </div>
      </div>

      {/* Digital Wallet Balance Card & UPI Withdrawal */}
      <DigitalWalletCard
        onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
        onOpenPassbook={() => setIsPassbookOpen(true)}
        pendingAmount={currentPickup?.status !== 'completed' ? currentPickup?.totalEstimatedValue || 0 : 0}
      />

      {/* Active Doorstep Pickup Card (Key Requirement from Prompt) */}
      {currentPickup && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-base">
                    Active Pickup Order: <span className="font-mono text-emerald-400">#{currentPickup.id}</span>
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      currentPickup.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : currentPickup.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {currentPickup.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Scheduled for <span className="text-slate-300 font-medium">{currentPickup.preferredSlot}</span>
                </p>
              </div>
            </div>

            {/* Crucial OTP Badge */}
            <div className="flex items-center gap-3 bg-slate-950 p-2.5 sm:px-4 sm:py-2 rounded-xl border border-emerald-500/40 shadow-inner">
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-emerald-400 block tracking-wider">
                  Doorstep Verification OTP
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:block">
                  Share with collector after weighing
                </span>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30">
                {currentPickup.otp}
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Collector Profile Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={collector.avatar}
                  alt={collector.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/50"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-100 text-sm">{collector.name}</h4>
                    <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400" title="CPCB Verified Partner">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{collector.vehicleType}</p>
                  <p className="text-[11px] font-mono text-emerald-400 font-semibold">{collector.vehiclePlate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowCollectorReviews(true)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/40 transition-all text-left flex flex-col items-center group cursor-pointer"
                  title="Click to view verified reviews & breakdown"
                >
                  <span className="text-slate-400 text-[10px] block group-hover:text-amber-300">Verified Rating</span>
                  <span className="font-bold text-amber-300 font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{collector.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({collector.totalReviews || 1248})</span>
                  </span>
                  <span className="text-[9px] text-emerald-400 underline underline-offset-1 mt-0.5">Read reviews</span>
                </button>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-center">
                  <span className="text-slate-400 text-[10px] block">Trips Completed</span>
                  <span className="font-bold text-slate-200 font-mono">{collector.totalPickups}+</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">100% Weighed</span>
                </div>
              </div>

              {currentPickup.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => openRatingModal(currentPickup)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentPickup.rating ? 'Edit Your Pickup Rating' : 'Rate Your Pickup & Collector'}</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${collector.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Collector</span>
                </a>
                <button
                  onClick={() => {
                    setActiveViewTab('live_tracker');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Track Live Map</span>
                </button>
              </div>
            </div>

            {/* Items in this Pickup */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">
                  Materials Declared ({currentPickup.items.length})
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  Est. ₹{currentPickup.totalEstimatedValue}
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {currentPickup.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div>
                      <p className="font-medium text-slate-200">{item.itemName}</p>
                      <span className="text-[10px] text-slate-500">₹{item.ratePerUnit}/kg</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-300 font-semibold">{item.verifiedWeight ?? item.estimatedWeight} kg</span>
                      <span className="block text-[10px] text-emerald-400">
                        ₹{((item.verifiedWeight ?? item.estimatedWeight) * item.ratePerUnit).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Instant Payout via:</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {currentPickup.payoutMethod || 'UPI'} {currentPickup.upiId ? `(${currentPickup.upiId})` : ''}
                </span>
              </div>
            </div>

            {/* Live Route & ETA Simulation */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Live Collector Location
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">ETA ~ 8 Mins</span>
                </div>

                {/* Visual Route Strip */}
                <div className="relative h-28 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-3">
                  {/* Stylized Indian city map grid illustration */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 w-full space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Indiranagar Hub #4</span>
                      </span>
                      <span className="text-emerald-400 font-bold">650m away</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>Your Flat #402</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[78%] rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 shadow-md animate-pulse" />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center font-mono">
                      Cargo E-Rickshaw traveling on Sector 4 Main Arterial Road
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 bg-emerald-950/30 border border-emerald-900/30 p-2 rounded-lg">
                🔒 <strong>Tamper-Proof Guarantee:</strong> The collector will weigh scrap in front of you on a certified Bluetooth scale. Check scale LCD before sharing your OTP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unrated Completed Pickup Callout Banner */}
      {unratedCompletedPickup && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Pending Partner Feedback
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Order #{unratedCompletedPickup.id}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                How was your doorstep scrap collection with {unratedCompletedPickup.collectorName || collector.name}?
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Your star rating directly updates {unratedCompletedPickup.collectorName?.split(' ')[0] || collector.name.split(' ')[0]}&apos;s verified trust badge and confirms scale honesty.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <button
              onClick={() => openRatingModal(unratedCompletedPickup)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Leave Verified Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Environmental Impact Dashboard (Prominent Requirement from Prompt) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Verified Circular Economy Impact</span>
            </div>
            <h3 className="text-xl font-bold text-white">Your Household Environmental Contribution</h3>
            <p className="text-xs text-slate-400">
              Track real resources conserved by diverting dry scrap away from open municipal landfills
            </p>
          </div>

          <button
            onClick={() => {
              setShowCertificate(true);
              triggerCelebration();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>View Circular Citizen Certificate</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Water Saved */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-900/30 relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Water Conserved</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-300">
              {totalWaterSaved.toLocaleString()}
              <span className="text-xs text-slate-400 font-normal ml-1">L</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Equivalent to ~{Math.round(totalWaterSaved / 150)} family bath cycles
            </p>
          </div>

          {/* CO2 Avoided */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-900/30 relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">CO₂ Avoided</span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Wind className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-300">
              {totalCo2Avoided.toFixed(1)}
              <span className="text-xs text-slate-400 font-normal ml-1">kg</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Diverted from methane landfill emissions
            </p>
          </div>

          {/* Trees Preserved */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/30 relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Trees Preserved</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Trees className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300">
              {totalTreesPreserved.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal ml-1">Trees</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Via high-grade paper & cardboard recycling
            </p>
          </div>

          {/* Cash Earned & Wallet Quick Action */}
          <div
            onClick={() => setIsWithdrawModalOpen(true)}
            className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 relative overflow-hidden group hover:border-emerald-500/50 transition-all cursor-pointer"
            title="Click to withdraw wallet scrap earnings to UPI"
          >
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Total Scrap Money</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 group-hover:text-emerald-300 transition-colors">
              ₹{totalEarnedCash.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px]">
              <span className="text-slate-400">Wallet: ₹{walletBalance.toFixed(0)}</span>
              <span className="text-emerald-400 font-bold group-hover:underline">Withdraw to UPI →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Environmental Impact Trajectory Chart using Recharts */}
      <EnvironmentalImpactChart />

      {/* Live Scrap Catalog with one-click calculator selector */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Today's Scrap Rate Board</h3>
            <p className="text-xs text-slate-400">
              Updated daily based on industrial refinery demand and MCX metals exchange
            </p>
          </div>
          <button
            onClick={onOpenCalculator}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Weight Calculator</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {scrapItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Spot Rate</span>
                  <span className="text-base font-extrabold font-mono text-emerald-400">
                    ₹{item.price}
                    <span className="text-xs text-slate-400 font-normal">/{item.unit}</span>
                  </span>
                </div>
                <button
                  onClick={onOpenSchedule}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-medium transition-all"
                >
                  Sell This
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selling History & Digital Receipts */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-1">Scrap Selling History & Digital Receipts</h3>
        <p className="text-xs text-slate-400 mb-4">
          All doorstep weigh-ins are backed by cryptographic digital receipts and bank UTRs
        </p>

        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
          {pickups.map((p) => (
            <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-200 text-xs">#{p.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">• {p.scheduledDate}</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{p.customerAddress}</p>
                <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                  {p.items.map((it, idx) => (
                    <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {it.itemName}: {it.verifiedWeight ?? it.estimatedWeight} kg
                    </span>
                  ))}
                </div>

                {/* Rating display or callout */}
                {p.status === 'completed' && (
                  <div className="pt-2">
                    {p.rating ? (
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold font-mono text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            <span>{p.rating}.0</span>
                          </span>
                          {p.review && (
                            <span className="text-slate-300 italic text-[11px] line-clamp-1">
                              &ldquo;{p.review}&rdquo;
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {p.feedbackTags?.slice(0, 2).map((tag, tIdx) => (
                            <span key={tIdx} className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-950 text-emerald-400 text-[10px] border border-slate-800">
                              {tag}
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => openRatingModal(p)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-1"
                          >
                            Edit Review
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-amber-300 flex items-center gap-1.5 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Pickup completed. How was {p.collectorName || collector.name}&apos;s service?</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => openRatingModal(p)}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all shadow-sm shrink-0"
                        >
                          Rate Partner
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Total Payout</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  ₹{(p.finalPayout || p.totalEstimatedValue).toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-500 font-mono">
                  {p.payoutMethod || 'UPI'} • {p.status === 'completed' ? 'UTR: 4291884912' : 'Pending Weighed OTP'}
                </span>
                {p.status === 'completed' && !p.rating && (
                  <button
                    type="button"
                    onClick={() => openRatingModal(p)}
                    className="mt-2 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 w-full transition-colors"
                  >
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>Rate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Circular Citizen Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xl text-white">GREEN CITIZEN CERTIFICATE</h4>
                  <p className="text-xs text-emerald-400 font-mono">PUNARNAVA CIRCULAR RECOGNITION</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4 my-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">This certifies that</p>
              <h2 className="text-2xl font-black text-emerald-300 tracking-wide">
                ANANYA SHARMA & HOUSEHOLD
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Has actively contributed to India's circular economy by sustainably diverting dry municipal waste through verified partner collectors.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Water Conserved</span>
                  <span className="font-bold text-sm font-mono text-blue-400">{totalWaterSaved} Liters</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CO₂ Abated</span>
                  <span className="font-bold text-sm font-mono text-teal-400">{totalCo2Avoided} kg</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Trees Preserved</span>
                  <span className="font-bold text-sm font-mono text-emerald-400">{totalTreesPreserved}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-3 font-mono">
                <span>CPCB Registration #DL-EPR-2026-992</span>
                <span>Verified Cryptographic Hash: 0x9F3B20</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Done
              </button>
              <button
                onClick={() => {
                  showToast('📄 Green Citizen Certificate saved with verified cryptographic QR signature!');
                  setShowCertificate(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Rating & Feedback Modal */}
      {ratingModalPickup && (
        <PickupRatingModal
          pickup={ratingModalPickup}
          onClose={closeRatingModal}
        />
      )}

      {/* Collector Public Verified Reviews Drawer */}
      {showCollectorReviews && (
        <CollectorReviewsDrawer
          onClose={() => setShowCollectorReviews(false)}
          onOpenRate={() => {
            const target = unratedCompletedPickup || currentPickup || pickups[0];
            if (target) openRatingModal(target);
          }}
        />
      )}

      {/* Instant UPI Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <UpiWithdrawModal
          onClose={() => setIsWithdrawModalOpen(false)}
          onOpenPassbook={() => setIsPassbookOpen(true)}
        />
      )}

      {/* Wallet Passbook & UTR History Modal */}
      {isPassbookOpen && (
        <WalletPassbookModal
          onClose={() => setIsPassbookOpen(false)}
          onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
        />
      )}
    </div>
  );
};
