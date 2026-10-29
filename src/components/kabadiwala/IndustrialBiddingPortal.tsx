import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BiddingTender, ScrapCategory } from '../../types';
import {
  Gavel,
  Plus,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Flame,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IndustrialBiddingPortal: React.FC = () => {
  const { biddingTenders, createBiddingTender, acceptWinningBid, placeBidOnTender, collector } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New tender state
  const [title, setTitle] = useState('Lot #107: 1.5 MT High-Grade Clean Copper Wire (Bright)');
  const [scrapType, setScrapType] = useState('Pure Copper Wire');
  const [category, setCategory] = useState<ScrapCategory>('Metals');
  const [quantityKg, setQuantityKg] = useState<number>(1500);
  const [basePricePerKg, setBasePricePerKg] = useState<number>(780);
  const [purityGrade, setPurityGrade] = useState('99.5% pure millberry scrap, moisture < 0.2%');

  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    createBiddingTender({
      title,
      scrapType,
      category,
      quantityKg,
      basePricePerKg,
      currentHighestBid: basePricePerKg,
      highestBidder: 'Awaiting First Industrial Tender Bid',
      timeLeft: '04h 00m',
      purityGrade,
    });
    setShowCreateModal(false);
  };

  const handleSimulateRecyclerCounterBid = (tender: BiddingTender) => {
    const industrialBuyers = [
      'Tata Steel Recycling Division',
      'Hindalco Industries Circular Metals',
      'GreenPlast Polymers Ltd',
      'ITC Paperboards & Packaging',
      'Unilever Sustainable Packaging India',
    ];
    const buyer = industrialBuyers[Math.floor(Math.random() * industrialBuyers.length)];
    const counterBid = Number((tender.currentHighestBid * (1 + 0.03 + Math.random() * 0.05)).toFixed(1));
    placeBidOnTender(tender.id, counterBid, buyer);
  };

  return (
    <div className="space-y-4">
      {/* Fair Bidding Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">
                Fair-Value Industrial Recycler Bidding Portal
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Cartel Bypassed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct B2B auction connecting collection hubs directly to steel mills, paperboard plants, and FMCG packaging giants
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Bulk Lot For Bidding</span>
        </button>
      </div>

      {/* Active Tenders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {biddingTenders.map((tender) => {
          const isClosed = tender.status === 'accepted' || tender.status === 'closed';
          const totalValuation = tender.quantityKg * tender.currentHighestBid;

          return (
            <div
              key={tender.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isClosed
                  ? 'bg-slate-950/80 border-slate-800 opacity-80'
                  : 'bg-slate-900 border-emerald-500/40 shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {tender.id}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{tender.timeLeft}</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-100 text-sm mb-1 leading-snug">{tender.title}</h4>
                <p className="text-xs text-slate-400 mb-2">
                  Hub: <span className="text-slate-300">{tender.collectorHub}</span>
                </p>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Quality Grade:</span>
                    <span className="text-slate-200 font-medium">{tender.purityGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {tender.quantityKg >= 1000 ? `${(tender.quantityKg / 1000).toFixed(2)} MT` : `${tender.quantityKg} kg`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserve Floor:</span>
                    <span className="font-mono">₹{tender.basePricePerKg}/kg</span>
                  </div>
                </div>

                {/* Bidding Status Box */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/50 to-slate-950 border border-emerald-500/30 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold uppercase">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Current Leading Bid
                    </span>
                    <span className="font-mono text-slate-400">({tender.bidsCount} institutional bids)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-black font-mono text-emerald-300">
                      ₹{tender.currentHighestBid.toFixed(1)}
                      <span className="text-xs font-normal text-slate-400 ml-1">/kg</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Lot Value</span>
                      <span className="text-sm font-bold font-mono text-white">
                        ₹{totalValuation.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium truncate">{tender.highestBidder}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {!isClosed ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulateRecyclerCounterBid(tender)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      title="Simulate incoming competitive corporate bid"
                    >
                      Simulate Bid (+4%)
                    </button>
                    <button
                      onClick={() => acceptWinningBid(tender.id)}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Deal</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold font-mono">
                    ✓ Deal Finalized with {tender.highestBidder}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Tender Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-1">Post Bulk Aggregated Lot for Recycler Bidding</h3>
            <p className="text-xs text-slate-400 mb-4">
              Direct institutional tender broadcast to verified circular packaging plants
            </p>

            <form onSubmit={handleCreateTender} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tender Title:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ScrapCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  >
                    <option value="Metals">Metals</option>
                    <option value="Plastics">Plastics</option>
                    <option value="Paper">Paper</option>
                    <option value="EWaste">E-Waste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Total Mass (kg):</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Base Reserve Price (₹/kg):</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={basePricePerKg}
                    onChange={(e) => setBasePricePerKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Scrap Material:</label>
                  <input
                    type="text"
                    required
                    value={scrapType}
                    onChange={(e) => setScrapType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Purity & Inspection Notes:</label>
                <input
                  type="text"
                  value={purityGrade}
                  onChange={(e) => setPurityGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950"
                >
                  Broadcast Tender to Recyclers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
