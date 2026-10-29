import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';
import {
  Power,
  Radio,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Phone,
  Navigation,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const UberDriverMode: React.FC<{
  onOpenHandOff: (pickup: PickupRequest) => void;
}> = ({ onOpenHandOff }) => {
  const {
    driverIsOnline,
    toggleDriverOnline,
    incomingRideAlert,
    acceptIncomingRide,
    declineIncomingRide,
    collector,
    pickups,
    updatePickupStatus,
  } = useApp();

  const [countdown, setCountdown] = useState<number>(15);

  // Active accepted trip
  const activeTrip = pickups.find((p) => p.status === 'in_progress' || p.status === 'arrived');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (incomingRideAlert) {
      setCountdown(15);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            declineIncomingRide();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [incomingRideAlert, declineIncomingRide]);

  return (
    <div className="space-y-4">
      {/* Driver Online / Offline Hero Toggle (Like Uber Driver App) */}
      <div
        className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
          driverIsOnline
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/50 shadow-2xl'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              driverIsOnline
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Power className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-black text-white text-lg">
                {driverIsOnline ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                  driverIsOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {driverIsOnline ? 'Accepting Requests' : 'Shift Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {driverIsOnline
                ? 'Receiving doorstep pickup pings within 2 km of Sector 4 & Indiranagar'
                : 'Tap switch to go online and start collecting dry scrap with your E-Rickshaw'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleDriverOnline}
          className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
            driverIsOnline
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 hover:scale-105'
          }`}
        >
          {driverIsOnline ? 'Go Offline' : 'GO ONLINE NOW'}
        </button>
      </div>

      {/* Active Trip Navigation Card (If driver has accepted an order) */}
      {activeTrip && (
        <div className="p-5 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="font-extrabold text-white text-base">Active Scrap Navigation</h4>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Trip #{activeTrip.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  👤
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">{activeTrip.customerName}</h5>
                  <p className="text-xs text-slate-400">{activeTrip.customerAddress}</p>
                  <p className="text-[11px] font-mono text-emerald-400">{activeTrip.landmark}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={`tel:${activeTrip.customerPhone}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Customer</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Materials Declared:</span>
                <span className="font-mono font-bold text-emerald-400">
                  Est. ₹{activeTrip.totalEstimatedValue}
                </span>
              </div>
              <p className="text-xs text-slate-300 my-2">
                {activeTrip.items.map((it) => `${it.itemName} (~${it.estimatedWeight}kg)`).join(', ')}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                {activeTrip.status === 'in_progress' ? (
                  <button
                    onClick={() => {
                      updatePickupStatus(activeTrip.id, 'arrived');
                      onOpenHandOff(activeTrip);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Arrived • Open Scale Terminal</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenHandOff(activeTrip)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Resume Weighing & Enter OTP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uber Incoming Pickup Alert Modal (Rings with countdown like Uber driver) */}
      {incomingRideAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl overflow-hidden text-center space-y-4">
            {/* Top countdown badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>NEW SCRAP REQUEST</span>
              </span>
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-mono font-extrabold text-sm">
                {countdown}s
              </div>
            </div>

            <div className="py-2">
              <span className="text-3xl">🛺</span>
              <h3 className="text-2xl font-black text-white mt-1">
                {incomingRideAlert.customerName}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {incomingRideAlert.customerAddress}
              </p>
              <p className="text-[11px] text-emerald-400 font-mono">
                Distance: ~450m • Sector 4 Cluster
              </p>
            </div>

            {/* Estimated Value & Scrap Load */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Total Value:</span>
                <span className="text-xl font-black font-mono text-emerald-300">
                  ₹{incomingRideAlert.totalEstimatedValue}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Scrap Composition:</span>
                <span className="text-slate-200">
                  {incomingRideAlert.items.map((i) => i.itemName).join(', ')}
                </span>
              </div>
            </div>

            {/* Accept / Decline actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={declineIncomingRide}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>Decline</span>
              </button>
              <button
                onClick={() => acceptIncomingRide(incomingRideAlert.id)}
                className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>ACCEPT PICKUP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
