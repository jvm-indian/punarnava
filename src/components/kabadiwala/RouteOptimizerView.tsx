import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Fuel,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const RouteOptimizerView: React.FC<{
  onOpenHandOff: (pickup: PickupRequest) => void;
}> = ({ onOpenHandOff }) => {
  const { pickups, updatePickupStatus, collector, speakVoice } = useApp();
  const [activeStep, setActiveStep] = useState(0);

  // Group pending/active pickups into today's optimized sequence
  const routeStops = pickups.filter((p) => p.status !== 'cancelled');

  const currentStop = routeStops[activeStep] || routeStops[0];

  const handleStartNavigation = () => {
    if (currentStop) {
      updatePickupStatus(currentStop.id, 'in_progress');
      speakVoice(`Navigating to stop ${activeStep + 1}: ${currentStop.customerName} at ${currentStop.landmark}`);
    }
  };

  const handleMarkArrived = (pickup: PickupRequest) => {
    updatePickupStatus(pickup.id, 'arrived');
    speakVoice(`Arrived at ${pickup.customerName}'s doorstep. Please open Bluetooth scale.`);
    onOpenHandOff(pickup);
  };

  return (
    <div className="space-y-4">
      {/* Route Efficiency & Fuel Stats Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Google Maps Multi-Stop AI Route Optimizer
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Optimized Sequence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cluster: <strong className="text-slate-300">{collector.aggregationHub}</strong> • Vehicle: {collector.vehicleType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Total Distance</span>
            <span className="font-bold text-emerald-400">14.8 km</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">EV Power Saved</span>
            <span className="font-bold text-teal-400">3.4 kWh (₹68)</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">Pending Pickups</span>
            <span className="font-bold text-amber-300">
              {routeStops.filter((s) => s.status !== 'completed').length} / {routeStops.length}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Route Corridor */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden p-5">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Route Header strip */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Today's Pickup Sequence (Sequential Dispatch):</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Hub Departure: 08:30 AM • Return to Weighbridge: 06:00 PM
          </span>
        </div>

        {/* Sequential Stops Timeline */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-3">
          {routeStops.map((stop, index) => {
            const isCompleted = stop.status === 'completed';
            const isArrived = stop.status === 'arrived';
            const isInProgress = stop.status === 'in_progress';
            const isSelected = activeStep === index;

            return (
              <div
                key={stop.id}
                onClick={() => setActiveStep(index)}
                className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isInProgress
                          ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                          : isArrived
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stop.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-200 text-xs line-clamp-1">{stop.customerName}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{stop.customerAddress}</p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-1">
                    {stop.landmark || 'Near Metro Signal'}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">{stop.items.length} items</span>
                  <span className="font-mono text-emerald-400 font-semibold">₹{stop.totalEstimatedValue}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stop Action Panel */}
        {currentStop && (
          <div className="relative z-10 mt-5 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  Stop #{activeStep + 1} of {routeStops.length}:
                </span>
                <span className="font-bold text-slate-100 text-sm">{currentStop.customerName}</span>
                <span className="text-xs text-slate-400 font-mono">({currentStop.customerPhone})</span>
              </div>
              <p className="text-xs text-slate-300">
                {currentStop.customerAddress} • <span className="text-emerald-400">{currentStop.preferredSlot}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={`tel:${currentStop.customerPhone}`}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Call Customer"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </a>

              {currentStop.status !== 'completed' && (
                <>
                  <button
                    onClick={handleStartNavigation}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    <span>Navigate</span>
                  </button>

                  <button
                    onClick={() => handleMarkArrived(currentStop)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>I Have Arrived • Weigh Scrap</span>
                  </button>
                </>
              )}

              {currentStop.status === 'completed' && (
                <span className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Completed & Settled</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
