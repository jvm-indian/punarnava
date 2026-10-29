import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScrapItem, ScrapCategory } from '../../types';
import {
  ShieldCheck,
  TrendingUp,
  Sliders,
  Users,
  Building,
  BarChart3,
  Coins,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Droplets,
  Wind,
  Trees,
  Award,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    scrapItems,
    updateScrapRate,
    collector,
    updateCollectorKyc,
    pickups,
    biddingTenders,
    eprCredits,
    claimEprTokenByCorp,
    auditLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rates' | 'kyc' | 'epr' | 'analytics' | 'audit'>('rates');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);
  const [selectedCorpBuyer, setSelectedCorpBuyer] = useState('Hindustan Unilever Ltd (HUL)');

  // Compute ecosystem stats
  const totalKgCollectedToday = pickups.reduce((acc, p) => {
    return acc + p.items.reduce((sum, it) => sum + (it.verifiedWeight ?? it.estimatedWeight), 0);
  }, 0);

  const totalPayoutsDisbursed = pickups.reduce((acc, p) => acc + (p.finalPayout || p.totalEstimatedValue || 0), 0);
  const totalWaterSaved = pickups.reduce((acc, p) => acc + (p.impact?.waterSavedLiters || 0), 0);
  const totalCo2Avoided = pickups.reduce((acc, p) => acc + (p.impact?.co2SavedKg || 0), 0);

  const handleStartEditRate = (item: ScrapItem) => {
    setEditingItemId(item.id);
    setNewPriceValue(item.price);
  };

  const handleSaveRate = (itemId: string) => {
    if (newPriceValue > 0) {
      updateScrapRate(itemId, newPriceValue);
      setEditingItemId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Ecosystem Governance Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/70 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono uppercase font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Central Ecosystem Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Ecosystem Governance & Price Control Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Administer real-time scrap rates, formalize informal kabadiwala partners, and audit corporate EPR compliance
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Dry Waste Inflow</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {(totalKgCollectedToday / 1000).toFixed(2)} MT
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">UPI Disbursed</span>
              <span className="text-xl font-bold font-mono text-amber-300">
                ₹{totalPayoutsDisbursed.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Pickups</span>
              <span className="text-xl font-bold font-mono text-teal-300">{pickups.length} Orders</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">EPR Tokens</span>
              <span className="text-xl font-bold font-mono text-blue-400">{eprCredits.length} Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'rates', label: 'Dynamic Price Board Adjuster', icon: <Sliders className="w-4 h-4" /> },
          { id: 'kyc', label: 'Collector KYC & Dignity Badging', icon: <Users className="w-4 h-4" /> },
          { id: 'epr', label: 'Corporate EPR Compliance Registry', icon: <Coins className="w-4 h-4" /> },
          { id: 'analytics', label: 'City-wide Circular Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'audit', label: 'Live Tamper-Proof Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
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

      {/* TAB 1: DYNAMIC PRICE BOARD ADJUSTER (Key Prompt Feature) */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Real-Time Industrial Market Price Setter</h3>
              <p className="text-xs text-slate-400">
                Updating prices here broadcasts immediately to all Collector and Citizen live tickers and calculators
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                Live Broadcast Link: MCX Spot Refinery API
              </span>
            </div>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <div className="grid grid-cols-12 gap-3 p-3 bg-slate-900 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Material / Category</div>
              <div className="col-span-2 text-center">Current Rate</div>
              <div className="col-span-2 text-center">24h Fluctuation</div>
              <div className="col-span-2 text-center">Allowed Range</div>
              <div className="col-span-2 text-right">Admin Action</div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {scrapItems.map((item) => {
                const isEditing = editingItemId === item.id;
                const isUp = item.change24h > 0;
                const isDown = item.change24h < 0;

                return (
                  <div key={item.id} className="grid grid-cols-12 gap-3 p-3.5 items-center text-xs hover:bg-slate-900/40 transition-colors">
                    <div className="col-span-4">
                      <p className="font-bold text-slate-200">{item.name}</p>
                      <span className="text-[10px] text-slate-500">{item.category} • {item.description}</span>
                    </div>

                    <div className="col-span-2 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-emerald-400 font-bold">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            value={newPriceValue}
                            onChange={(e) => setNewPriceValue(parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-slate-900 border border-emerald-500 rounded text-center font-mono font-bold text-emerald-300 text-xs focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-base font-extrabold font-mono text-emerald-400">
                          ₹{item.price}
                          <span className="text-xs text-slate-500 font-normal">/{item.unit}</span>
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isUp
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isDown
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isUp ? '+' : ''}{item.change24h}%
                      </span>
                    </div>

                    <div className="col-span-2 text-center font-mono text-slate-400 text-[11px]">
                      ₹{item.minPrice || item.price * 0.8} – ₹{item.maxPrice || item.price * 1.2}
                    </div>

                    <div className="col-span-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveRate(item.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditRate(item)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                        >
                          Adjust Price
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLLECTOR KYC & DIGNITY BADGING */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Informal Collector Formalization & KYC Verification</h3>
              <p className="text-xs text-slate-400">
                Grant formal identity, bank-linked Aadhaar validation, and doorstep safety police badges
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              1,420 Active Certified Partners
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={collector.avatar}
                  alt={collector.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">{collector.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {collector.badgeTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-slate-300">{collector.id}</span> • Phone: {collector.phone}
                  </p>
                  <p className="text-xs text-slate-400">
                    Aadhaar: <span className="font-mono text-emerald-300">{collector.aadhaarMasked}</span> • Police Clearance: {collector.policeVerificationDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateCollectorKyc('verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    collector.kycStatus === 'verified'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✓ Approve Verified Badge
                </button>
                <button
                  onClick={() => updateCollectorKyc('action_required')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    collector.kycStatus === 'action_required'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Request Police Re-check
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Doorstep Rating & Feedback</span>
                <div className="text-2xl font-bold font-mono text-amber-300">★ {collector.rating} / 5.0</div>
                <p className="text-slate-500 text-[10px] mt-1">Based on {collector.totalReviews || 1248} verified customer ratings</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Scale Calibration Check</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">Pass (0.00% Drift)</div>
                <p className="text-slate-500 text-[10px] mt-1">Weights verified by Bureau of Indian Standards</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Banking & Direct Benefit</span>
                <div className="text-2xl font-bold font-mono text-teal-300">UPI / Aadhaar Linked</div>
                <p className="text-slate-500 text-[10px] mt-1">Direct wallet disbursal with zero middlemen skim</p>
              </div>
            </div>

            {/* Recent Household Customer Reviews */}
            {collector.recentReviews && collector.recentReviews.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">
                    Recent Customer Ratings & Verified Feedback
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Audited Ledger
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {collector.recentReviews.slice(0, 4).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{rev.citizenName}</span>
                        <span className="font-mono text-amber-300 font-bold">★ {rev.rating}.0</span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        &ldquo;{rev.feedback}&rdquo;
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {rev.tags.slice(0, 2).map((tg, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CORPORATE EPR REGISTRY */}
      {activeTab === 'epr' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Corporate EPR Credit Registry & Certificate Clearing</h3>
              <p className="text-xs text-slate-400">
                Central Pollution Control Board (CPCB) statutory plastic & e-waste compliance quotas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCorpBuyer}
                onChange={(e) => setSelectedCorpBuyer(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
              >
                <option value="Hindustan Unilever Ltd (HUL)">Hindustan Unilever Ltd (HUL)</option>
                <option value="Bisleri International Circl">Bisleri International Circl</option>
                <option value="ITC Limited Packaging">ITC Limited Packaging</option>
                <option value="Dabur India Green Net">Dabur India Green Net</option>
                <option value="PepsiCo India Positive Circularity">PepsiCo India Positive Circularity</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {eprCredits.map((token) => (
              <div
                key={token.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-300">{token.tokenCode}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {token.tonnage} Metric Tonnes
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      Status: {token.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{token.scrapType}</h4>
                  <p className="text-xs text-slate-400">
                    Collector Origin: <span className="text-slate-300">{token.collectorName}</span> • Corporate Holder:{' '}
                    <strong className="text-teal-300">{token.corporateBuyer}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {token.status === 'minted' ? (
                    <button
                      onClick={() => claimEprTokenByCorp(token.id, selectedCorpBuyer)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-950"
                    >
                      Assign to {selectedCorpBuyer.split(' ')[0]}
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Certified Compliant</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CITY-WIDE CIRCULAR ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span>Municipal Water Preserved</span>
              </div>
              <div className="text-3xl font-black font-mono text-blue-400">
                {totalWaterSaved.toLocaleString()} Liters
              </div>
              <p className="text-xs text-slate-500 mt-1">Diverted from industrial virgin extraction</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Wind className="w-4 h-4 text-teal-400" />
                <span>GHG / CO₂ Emissions Prevented</span>
              </div>
              <div className="text-3xl font-black font-mono text-teal-400">
                {totalCo2Avoided.toFixed(1)} kg CO₂
              </div>
              <p className="text-xs text-slate-500 mt-1">From open dumpsite incineration</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Fair-Income Disbursed to Informal Sector</span>
              </div>
              <div className="text-3xl font-black font-mono text-amber-400">
                ₹{totalPayoutsDisbursed.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Directly into collector bank accounts</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="font-bold text-white text-base mb-2">Cluster Aggregation Hubs Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: 'Cluster Hub #1 - Sector 4', stock: '4.2 MT', collectors: 18, status: 'Active' },
                { name: 'Cluster Hub #2 - MG Road', stock: '6.8 MT', collectors: 24, status: 'Active' },
                { name: 'Cluster Hub #3 - Indiranagar', stock: '5.1 MT', collectors: 22, status: 'Active' },
                { name: 'Cluster Hub #4 - Koramangala', stock: '8.4 MT', collectors: 31, status: 'Auction Active' },
              ].map((hub, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-200 block mb-1">{hub.name}</span>
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Stock: <strong className="text-emerald-400">{hub.stock}</strong></span>
                    <span>{hub.collectors} Collectors</span>
                  </div>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                    {hub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-base">Real-Time Cryptographic Ledger & Audit Logs</h3>
              <p className="text-xs text-slate-400">
                Doorstep scale hashes, OTP handoffs, rate broadcasts, and refinery bank transfers
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 text-[10px] font-bold">
                      {log.action}
                    </span>
                    <span className="text-slate-300 font-sans font-medium">{log.actor} ({log.role})</span>
                  </div>
                  <p className="text-slate-400 font-sans text-xs">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-600 self-start sm:self-auto">{log.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
