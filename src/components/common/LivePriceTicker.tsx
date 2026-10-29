import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScrapCategory } from '../../types';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export const LivePriceTicker: React.FC<{ onOpenCalculator?: () => void }> = ({ onOpenCalculator }) => {
  const { scrapItems, lastRateUpdate, selectedCity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ScrapCategory | 'All'>('All');

  const categories: (ScrapCategory | 'All')[] = ['All', 'Paper', 'Plastics', 'Metals', 'EWaste', 'Glass'];

  const filteredItems = selectedCategory === 'All'
    ? scrapItems
    : scrapItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="w-full bg-emerald-50/80 border-b border-emerald-100/90 backdrop-blur-md">
      {/* Ticker bar header */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold tracking-wide uppercase text-[10px] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Live Market Rates
          </div>
          <span className="text-slate-600 hidden sm:inline text-xs">
            Direct Refinery Demand Benchmark for <span className="font-semibold text-slate-800">{selectedCity}</span> • <span className="text-emerald-800 font-mono font-medium">{lastRateUpdate}</span>
          </span>
        </div>

        {/* Category quick filters & calculator button */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-emerald-200/80 shadow-2xs">
            <Filter className="w-3 h-3 text-emerald-600 ml-1.5" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {cat === 'EWaste' ? 'E-Waste' : cat}
              </button>
            ))}
          </div>

          {onOpenCalculator && (
            <button
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Calculator</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal scrolling price chips */}
      <div className="overflow-x-auto no-scrollbar py-2 px-4 max-w-7xl mx-auto flex items-center gap-2.5">
        {filteredItems.map((item) => {
          const isUp = item.change24h > 0;
          const isDown = item.change24h < 0;

          return (
            <div
              key={item.id}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-600 font-medium group-hover:text-emerald-700 transition-colors">
                  {item.name}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold font-mono text-emerald-700">
                    ₹{item.price}
                    <span className="text-[10px] text-slate-500 font-normal">/{item.unit}</span>
                  </span>
                  <div
                    className={`flex items-center text-[10px] font-bold ${
                      isUp
                        ? 'text-emerald-600'
                        : isDown
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {isUp && <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />}
                    {isDown && <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />}
                    {!isUp && !isDown && <Minus className="w-2.5 h-2.5" />}
                    <span>{Math.abs(item.change24h)}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
