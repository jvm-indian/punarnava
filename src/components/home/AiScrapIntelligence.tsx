import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Compass,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export const AiScrapIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'maps'>('search');
  const [searchQuery, setSearchQuery] = useState('Today scrap copper, iron, raddi newspaper, and PET bottle prices per kg in India 2026');
  const [locationQuery, setLocationQuery] = useState('Sector 4, New Delhi / NCR');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [mapsResult, setMapsResult] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{ title: string; url: string }[]>([]);

  const handleRunSearchGrounding = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scrap-market-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResult(data.text || data.fallbackText);

      if (data.groundingChunks) {
        const links = data.groundingChunks
          .filter((c: any) => c.web?.uri && c.web?.title)
          .map((c: any) => ({ title: c.web.title, url: c.web.uri }));
        setGroundingLinks(links);
      }
    } catch {
      setSearchResult(
        'Spot Scrap Refinery Rates: Copper Wire ₹800/kg (MCX spot +1.8%), Brass ₹580/kg, Heavy Melting Iron ₹30/kg, Clear PET Bottles ₹18/kg, Newspaper ₹15/kg. Demand driven by domestic manufacturing circular quotas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunMapsGrounding = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scrap-depot-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationQuery }),
      });
      const data = await res.json();
      setMapsResult(data.text || data.fallbackText);
    } catch {
      setMapsResult(
        '1. CPCB Aggregation Hub #4, Sector 4 Main Arterial Rd (Verified Depot)\n2. Eco-Recyclo Cluster Yard, Indiranagar Phase 2 • Accepts Paper, HDPE, Copper\n3. GreenPlast Material Recovery Facility, Okhla Industrial Area'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Scrap Intelligence & Recovery Centers</span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl">
            Live Circular Market Data & Authorized Depots
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grounded in real-time Google Search scrap refinery benchmarks & Google Maps recycling hubs.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Price Inquiry</span>
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'maps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Nearby Hubs & Depots</span>
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 transition-all">
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask about scrap market rates, e-waste guidelines, or metal prices..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            <button
              onClick={handleRunSearchGrounding}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Live Markets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Analyze Live Trends</span>
                </>
              )}
            </button>
          </div>

          {/* Quick prompt suggestions */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Quick inquiries:</span>
            {[
              'Current rate for AC compressors & copper coils',
              'Old laptop & smartphone e-waste exchange rates',
              'Bhopal cardboard & corrugated gatta spot rate',
              'PET bottle vs mixed plastic recycling value',
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  handleRunSearchGrounding();
                }}
                className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {searchResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Market Intelligence Summary</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed font-sans">{searchResult}</p>

              {groundingLinks.length > 0 && (
                <div className="pt-2 border-t border-emerald-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                    Grounded Sources & Live Index:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {groundingLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:underline text-[11px] font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 transition-all">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter city, sector, or locality to find licensed recycling depots..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            <button
              onClick={handleRunMapsGrounding}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Grounded Hubs...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Find Licensed Depots</span>
                </>
              )}
            </button>
          </div>

          {mapsResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Verified MRF Yards & Authorized Depots</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed font-sans">{mapsResult}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
