import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EPRCredit } from '../../types';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  Building,
  Plus,
  Award,
  Coins,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const EprTokenGenerator: React.FC = () => {
  const { eprCredits, mintEprToken, collector } = useApp();
  const [showMintModal, setShowMintModal] = useState(false);
  const [scrapType, setScrapType] = useState('Post-Consumer Rigid Polypropylene (PP) Crates');
  const [category, setCategory] = useState<EPRCredit['category']>('Plastics');
  const [tonnage, setTonnage] = useState<number>(3.5);

  const totalTonnageTokens = eprCredits.reduce((acc, c) => acc + c.tonnage, 0);
  const totalEarnedIncentives = eprCredits.reduce((acc, c) => acc + c.incentiveAmount, 0);

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (tonnage > 0) {
      mintEprToken(scrapType, category, tonnage);
      setShowMintModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/70 border border-teal-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">
                CPCB Extended Producer Responsibility (EPR) Credit Minting
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                MoEFCC Rule Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Corporate FMCG brands (HUL, Bisleri, Dabur, ITC) purchase verified collection tokens to meet statutory targets
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMintModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-950 flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Mint Verified EPR Credit Token</span>
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block font-sans">Total Certified Tonnage</span>
          <span className="text-2xl font-black text-emerald-400">{totalTonnageTokens.toFixed(1)} MT</span>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Diverted from Indian waterways & landfills</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block font-sans">Collector Direct Green Incentive</span>
          <span className="text-2xl font-black text-amber-300">₹{totalEarnedIncentives.toLocaleString()}</span>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Direct CSR / compliance subsidy transferred to wallet</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block font-sans">Corporate Brand Partners</span>
          <span className="text-2xl font-black text-teal-300">HUL • Bisleri • ITC</span>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Audit-stamped by Central Pollution Control Board</p>
        </div>
      </div>

      {/* Tokens List */}
      <div className="space-y-3">
        {eprCredits.map((token) => (
          <div
            key={token.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-teal-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                  {token.tokenCode}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    token.status === 'transferred'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {token.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">• Date: {token.issuedDate}</span>
              </div>
              <h4 className="font-bold text-slate-100 text-sm">{token.scrapType}</h4>
              <p className="text-xs text-slate-400">
                Corporate Buyer: <strong className="text-slate-200">{token.corporateBuyer}</strong>
              </p>
            </div>

            <div className="flex items-center gap-5 shrink-0 justify-between md:justify-end">
              <div className="text-left md:text-right font-mono">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Token Weight</span>
                <span className="text-lg font-bold text-emerald-400">{token.tonnage} MT</span>
                <span className="text-xs text-amber-300 font-bold block">+₹{token.incentiveAmount} Payout</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <QrCode className="w-8 h-8 text-teal-400 mx-auto" />
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Verify QR</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mint Modal */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-1">Mint Verified EPR Credit Token</h3>
            <p className="text-xs text-slate-400 mb-4">
              Cryptographically verify collected mass for FMCG plastic & e-waste compliance quotas
            </p>

            <form onSubmit={handleMint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Scrap Stream:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EPRCredit['category'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <option value="Plastics">Plastics (HDPE, PET, Multilayer)</option>
                  <option value="EWaste">E-Waste & Electronics (RoHS)</option>
                  <option value="Metals">Non-Ferrous Metals</option>
                  <option value="Paper">Paperboard & Fibre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Detailed Stream Name:</label>
                <input
                  type="text"
                  required
                  value={scrapType}
                  onChange={(e) => setScrapType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Verified Net Mass (Metric Tonnes):</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={tonnage}
                  onChange={(e) => setTonnage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-300 flex items-center justify-between">
                <span>Direct Green Incentive:</span>
                <span className="font-bold font-mono text-sm">
                  ₹{Math.round(tonnage * (category === 'Plastics' ? 1500 : category === 'EWaste' ? 3000 : 1000)).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMintModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950"
                >
                  Mint & Publish to CPCB Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
