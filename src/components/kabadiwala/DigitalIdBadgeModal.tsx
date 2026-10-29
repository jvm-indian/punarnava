import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, QrCode, CheckCircle2, Award, Calendar, Phone, Truck, X } from 'lucide-react';

export const DigitalIdBadgeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { collector } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ID Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt CPCB Formal Partner</span>
          </div>
          <h3 className="font-extrabold text-white text-lg">PUNARNAVA ECO-ID</h3>
          <p className="text-[11px] text-slate-400 font-mono">Collector ID: {collector.id}</p>
        </div>

        {/* Collector Photo & Badge */}
        <div className="relative mx-auto w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl mb-4">
          <img src={collector.avatar} alt={collector.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center py-0.5 uppercase tracking-wider">
            {collector.badgeTier}
          </div>
        </div>

        <div className="text-center mb-4">
          <h4 className="font-extrabold text-slate-100 text-base">{collector.name}</h4>
          <p className="text-xs text-emerald-400 font-mono">{collector.phone}</p>
        </div>

        {/* Credentials Grid */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">KYC Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aadhaar Verified</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Masked UID:</span>
            <span className="font-mono text-slate-300">{collector.aadhaarMasked}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Police Clearance:</span>
            <span className="font-mono text-emerald-300">{collector.policeVerificationDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Vehicle Registered:</span>
            <span className="font-mono text-slate-300">{collector.vehiclePlate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Hub Cluster:</span>
            <span className="text-slate-300">{collector.aggregationHub}</span>
          </div>
        </div>

        {/* QR Code Verification for Doorstep Safety */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-20 h-20 bg-white p-1 rounded-xl mx-auto mb-1.5 flex items-center justify-center">
            <QrCode className="w-full h-full text-slate-950" />
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Scan with any phone camera to verify police & Aadhaar credentials
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Close ID Badge
        </button>
      </div>
    </div>
  );
};
