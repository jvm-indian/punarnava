import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';
import { RouteOptimizerView } from './RouteOptimizerView';
import { UberDriverMode } from './UberDriverMode';
import { HubInventoryView } from './HubInventoryView';
import { IndustrialBiddingPortal } from './IndustrialBiddingPortal';
import { EprTokenGenerator } from './EprTokenGenerator';
import { DoorstepHandOffModal } from './DoorstepHandOffModal';
import { DigitalIdBadgeModal } from './DigitalIdBadgeModal';
import { CollectorReviewsDrawer } from '../citizen/CollectorReviewsDrawer';
import {
  Truck,
  Navigation,
  Scale,
  Warehouse,
  Gavel,
  Coins,
  ShieldCheck,
  Volume2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BatteryMedium,
  CheckCircle,
  Star,
} from 'lucide-react';

export const KabadiwalaDashboard: React.FC<{
  onOpenScaleWidget: () => void;
}> = ({ onOpenScaleWidget }) => {
  const {
    collector,
    scaleState,
    tareScale,
    lockScaleReading,
    pickups,
    speakVoice,
    language,
    scrapItems,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'route' | 'inventory' | 'bidding' | 'epr'>('route');
  const [selectedHandOffPickup, setSelectedHandOffPickup] = useState<PickupRequest | null>(null);
  const [showIdBadge, setShowIdBadge] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Regional voice prompt triggers for non-literate or semi-literate collectors
  const handleVoiceTodayRates = () => {
    const copper = scrapItems.find((s) => s.id === 'metal-copper')?.price || 800;
    const raddi = scrapItems.find((s) => s.id === 'paper-news')?.price || 15;
    const pet = scrapItems.find((s) => s.id === 'plastic-pet')?.price || 18;
    const iron = scrapItems.find((s) => s.id === 'metal-iron')?.price || 30;

    if (language === 'hi') {
      speakVoice(`आज का भाव: तांबा ${copper} रुपये किलो, अखबार रद्दी ${raddi} रुपये किलो, प्लास्टिक बोतल ${pet} रुपये, लोहा ${iron} रुपये किलो`);
    } else {
      speakVoice(`Today's spot rates: Copper ${copper} rupees per kg, Newspaper ${raddi} rupees, PET Bottles ${pet} rupees, Iron ${iron} rupees per kg.`);
    }
  };

  const handleVoiceNextStop = () => {
    const pending = pickups.find((p) => p.status !== 'completed');
    if (pending) {
      if (language === 'hi') {
        speakVoice(`अगला स्टॉप है: ${pending.customerName}, पता: ${pending.customerAddress}`);
      } else {
        speakVoice(`Next pickup stop is: ${pending.customerName} at ${pending.customerAddress}`);
      }
    } else {
      speakVoice('All pickup stops completed for today!');
    }
  };

  const targetProgress = Math.min(100, Math.round((collector.todayCollectedKg / collector.todayTargetKg) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Partner Dignity & Daily Performance Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Profile & Badge */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={collector.avatar}
                alt={collector.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg shadow-emerald-950"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-950" title="Aadhaar Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{collector.name}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {collector.badgeTier}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Partner ID: <span className="font-mono text-emerald-400 font-semibold">{collector.id}</span> • {collector.vehicleType} ({collector.vehiclePlate})
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowReviews(true)}
                  className="flex items-center gap-1 text-amber-300 font-mono font-bold hover:underline"
                  title="View customer feedback"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{collector.rating}</span>
                  <span className="text-[11px] text-slate-400 font-normal">({collector.totalReviews || 1248} reviews)</span>
                </button>
                <span>•</span>
                <button
                  onClick={() => setShowIdBadge(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Show Verified Digital ID & QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Target, Earnings, Eco-Score */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Earnings</span>
              <span className="text-xl font-extrabold font-mono text-emerald-300">
                ₹{collector.totalEarnedToday.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">Commission & bonuses</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold mb-1">
                <span>Daily Target</span>
                <span className="font-mono text-emerald-400">{targetProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">
                {collector.todayCollectedKg} / {collector.todayTargetKg} kg
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">EPR Tokens Earned</span>
              <span className="text-xl font-extrabold font-mono text-teal-300">
                {collector.eprTokensEarned} Tokens
              </span>
              <span className="text-[10px] text-slate-500 block">Corporate subsidized</span>
            </div>
          </div>
        </div>

        {/* Accessible Voice Prompts Bar for Semi-Literate Collectors */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">Voice Assistant (आवाज़ सहायक):</span>
            <span className="text-slate-400 hidden sm:inline">Tap any button to hear aloud</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVoiceTodayRates}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>📢 Read Today's Scrap Rates</span>
            </button>
            <button
              onClick={handleVoiceNextStop}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>🧭 Speak Next Stop Directions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Uber Driver Online/Offline Shift Mode & Incoming Alert Ping */}
      <UberDriverMode onOpenHandOff={(p) => setSelectedHandOffPickup(p)} />

      {/* Embedded Live Bluetooth Weighing Scale Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Bluetooth Smart Scale Live Terminal
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {scaleState.isConnected ? 'Active & Calibrated' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Model: {scaleState.deviceName} • Battery: {scaleState.batteryLevel}%
            </p>
          </div>
        </div>

        {/* Big Reading Display */}
        <div className="flex items-center gap-4">
          <div className="px-5 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 shadow-inner text-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Current Scale Weight</span>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {scaleState.currentWeight.toFixed(2)}
              <span className="text-base text-slate-400 font-normal ml-1">kg</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={tareScale}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>TARE ZERO</span>
            </button>
            <button
              onClick={onOpenScaleWidget}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Scale Controls</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'route', label: "Today's Pickup Route", icon: <Navigation className="w-4 h-4" /> },
          { id: 'inventory', label: 'Aggregation Hub Stock', icon: <Warehouse className="w-4 h-4" /> },
          { id: 'bidding', label: 'Industrial Recycler Bidding', icon: <Gavel className="w-4 h-4" /> },
          { id: 'epr', label: 'EPR Credit Tokens', icon: <Coins className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'route' && (
        <RouteOptimizerView
          onOpenHandOff={(pickup) => setSelectedHandOffPickup(pickup)}
        />
      )}

      {activeTab === 'inventory' && (
        <HubInventoryView
          onOpenCreateTender={() => setActiveTab('bidding')}
        />
      )}

      {activeTab === 'bidding' && (
        <IndustrialBiddingPortal />
      )}

      {activeTab === 'epr' && (
        <EprTokenGenerator />
      )}

      {/* Doorstep Hand-off Modal */}
      {selectedHandOffPickup && (
        <DoorstepHandOffModal
          pickup={selectedHandOffPickup}
          isOpen={true}
          onClose={() => setSelectedHandOffPickup(null)}
        />
      )}

      {/* Digital ID Badge Modal */}
      <DigitalIdBadgeModal
        isOpen={showIdBadge}
        onClose={() => setShowIdBadge(false)}
      />

      {/* Verified Customer Reviews Drawer */}
      {showReviews && (
        <CollectorReviewsDrawer
          onClose={() => setShowReviews(false)}
        />
      )}
    </div>
  );
};
