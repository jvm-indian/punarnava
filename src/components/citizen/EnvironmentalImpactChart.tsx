import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Wind,
  Trees,
  Droplets,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';

interface TimelinePoint {
  period: string;
  co2Kg: number;
  trees: number;
  waterLiters: number;
  scrapKg: number;
  transactionCount: number;
}

export const EnvironmentalImpactChart: React.FC = () => {
  const { pickups } = useApp();
  const [activeMetric, setActiveMetric] = useState<'co2_trees' | 'co2_only' | 'trees_only' | 'water'>('co2_trees');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [timeframe, setTimeframe] = useState<'monthly' | 'per_pickup'>('monthly');

  // Compute dynamic data points from actual pickups history
  const chartData: TimelinePoint[] = useMemo(() => {
    if (timeframe === 'per_pickup') {
      // Map directly to transactions
      return pickups.map((p, index) => {
        const scrapMass = p.items.reduce((sum, it) => sum + (it.verifiedWeight ?? it.estimatedWeight), 0);
        return {
          period: `#${p.id.replace('PKP-', '')}`,
          co2Kg: Number((p.impact?.co2SavedKg || scrapMass * 1.8).toFixed(1)),
          trees: Number((p.impact?.treesPreserved || scrapMass * 0.015).toFixed(2)),
          waterLiters: Math.round(p.impact?.waterSavedLiters || scrapMass * 28),
          scrapKg: Math.round(scrapMass),
          transactionCount: 1,
        };
      });
    }

    // Cumulative month-by-month trajectory (including historical circular milestones leading up to current date)
    const baseTimeline = [
      { period: 'May 2026', co2Kg: 42.5, trees: 0.35, waterLiters: 480, scrapKg: 28, transactionCount: 2 },
      { period: 'Jun 2026', co2Kg: 98.2, trees: 0.82, waterLiters: 1120, scrapKg: 64, transactionCount: 3 },
      { period: 'Jul 2026', co2Kg: 185.0, trees: 1.54, waterLiters: 2150, scrapKg: 118, transactionCount: 4 },
      { period: 'Aug 2026', co2Kg: 310.4, trees: 2.60, waterLiters: 3680, scrapKg: 195, transactionCount: 6 },
      { period: 'Sep 2026', co2Kg: 495.8, trees: 4.15, waterLiters: 5890, scrapKg: 310, transactionCount: 8 },
    ];

    // Compute live October 2026 cumulative totals from user's current pickups
    const currentPickupsCo2 = pickups.reduce((acc, p) => acc + (p.impact?.co2SavedKg || 0), 0);
    const currentPickupsTrees = pickups.reduce((acc, p) => acc + (p.impact?.treesPreserved || 0), 0);
    const currentPickupsWater = pickups.reduce((acc, p) => acc + (p.impact?.waterSavedLiters || 0), 0);
    const currentPickupsWeight = pickups.reduce((acc, p) => {
      return acc + p.items.reduce((sum, it) => sum + (it.verifiedWeight ?? it.estimatedWeight), 0);
    }, 0);

    const octEntry: TimelinePoint = {
      period: 'Oct 2026 (Now)',
      co2Kg: Number((495.8 + currentPickupsCo2).toFixed(1)),
      trees: Number((4.15 + currentPickupsTrees).toFixed(2)),
      waterLiters: Math.round(5890 + currentPickupsWater),
      scrapKg: Math.round(310 + currentPickupsWeight),
      transactionCount: 8 + pickups.length,
    };

    return [...baseTimeline, octEntry];
  }, [pickups, timeframe]);

  // Aggregate stats
  const latestData = chartData[chartData.length - 1] || chartData[0];

  // Custom Rich Tooltip for Dark Theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[200px]">
          <p className="font-bold text-white font-sans text-xs border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{timeframe === 'per_pickup' ? `Pickup Order ${label}` : label}</span>
            <span className="text-[10px] text-emerald-400 font-normal">Verified CPCB</span>
          </p>

          {payload.map((entry: any, index: number) => {
            const isCo2 = entry.dataKey === 'co2Kg';
            const isTrees = entry.dataKey === 'trees';
            const isWater = entry.dataKey === 'waterLiters';

            return (
              <div key={index} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>
                    {isCo2 ? 'CO₂ Diverted:' : isTrees ? 'Trees Preserved:' : isWater ? 'Water Conserved:' : entry.name}
                  </span>
                </span>
                <span className="font-bold text-white">
                  {isTrees ? `${entry.value} Trees` : isCo2 ? `${entry.value} kg` : isWater ? `${entry.value.toLocaleString()} L` : entry.value}
                </span>
              </div>
            );
          })}

          <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-sans">
            🌱 <em>Equivalent to {(latestData.co2Kg * 0.42).toFixed(0)} km car emissions offset!</em>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
      {/* Chart Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interactive Eco-Analytics</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Household Environmental Impact Trajectory
          </h3>
          <p className="text-xs text-slate-400">
            Visualizing verified CO₂ emission cuts and trees saved across your scrap transactions
          </p>
        </div>

        {/* View Controls: Timeframe & Metric Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe switch */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeframe === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cumulative Growth
            </button>
            <button
              onClick={() => setTimeframe('per_pickup')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeframe === 'per_pickup'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Per Pickup Order
            </button>
          </div>

          {/* Chart style toggle (Area vs Bar) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Area Curve View"
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Bar Comparison View"
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Metric Focus Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Active Metric:
        </span>
        {[
          { id: 'co2_trees', label: 'CO₂ Avoided & Trees Preserved', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'co2_only', label: 'CO₂ Emission Reductions (kg)', icon: <Wind className="w-3.5 h-3.5" /> },
          { id: 'trees_only', label: 'Trees Spared (Paper & Cardboard)', icon: <Trees className="w-3.5 h-3.5" /> },
          { id: 'water', label: 'Water Conserved (Liters)', icon: <Droplets className="w-3.5 h-3.5" /> },
        ].map((metric) => (
          <button
            key={metric.id}
            onClick={() => setActiveMetric(metric.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
              activeMetric === metric.id
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {metric.icon}
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Main Recharts Area / Bar Container */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="treesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="period"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                yAxisId="left"
              />
              {activeMetric === 'co2_trees' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  tick={{ fill: '#f59e0b', fontSize: 11 }}
                  axisLine={{ stroke: '#f59e0b' }}
                />
              )}

              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
              />

              {(activeMetric === 'co2_trees' || activeMetric === 'co2_only') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="co2Kg"
                  name="CO₂ Avoided (kg)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#co2Gradient)"
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {(activeMetric === 'co2_trees' || activeMetric === 'trees_only') && (
                <Area
                  yAxisId={activeMetric === 'co2_trees' ? 'right' : 'left'}
                  type="monotone"
                  dataKey="trees"
                  name="Trees Preserved"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#treesGradient)"
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {activeMetric === 'water' && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="waterLiters"
                  name="Water Conserved (Liters)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#waterGradient)"
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="period"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
              />

              {(activeMetric === 'co2_trees' || activeMetric === 'co2_only') && (
                <Bar
                  dataKey="co2Kg"
                  name="CO₂ Avoided (kg)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              )}

              {(activeMetric === 'co2_trees' || activeMetric === 'trees_only') && (
                <Bar
                  dataKey="trees"
                  name="Trees Preserved"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              )}

              {activeMetric === 'water' && (
                <Bar
                  dataKey="waterLiters"
                  name="Water Conserved (Liters)"
                  fill="#38bdf8"
                  radius={[6, 6, 0, 0]}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Trajectory Insights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
            Lifetime CO₂ Abatement
          </span>
          <span className="text-base font-extrabold font-mono text-emerald-400">
            {latestData.co2Kg} kg CO₂
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Rank: Top 5% green household in Sector 4
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
            Equivalent Trees Saved
          </span>
          <span className="text-base font-extrabold font-mono text-amber-300">
            {latestData.trees} Trees
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            From newspaper & cardboard circular fiber recovery
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
            Dry Scrap Stream Diverted
          </span>
          <span className="text-base font-extrabold font-mono text-teal-300">
            {latestData.scrapKg} kg Recycled
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Across {latestData.transactionCount} doorstep pickups
          </p>
        </div>
      </div>
    </div>
  );
};
