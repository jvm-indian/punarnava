import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScrapCategory } from '../../types';
import {
  Package,
  Plus,
  TrendingUp,
  Warehouse,
  Boxes,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const HubInventoryView: React.FC<{
  onOpenCreateTender: () => void;
}> = ({ onOpenCreateTender }) => {
  const { hubInventory, addStockToHub, collector } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<ScrapCategory>('Plastics');
  const [name, setName] = useState('Sorted HDPE Crates & Jerrycans');
  const [weightKg, setWeightKg] = useState<number>(350);

  const totalInventoryWeightKg = hubInventory.reduce((acc, h) => acc + h.currentStockKg, 0);
  const totalValuation = hubInventory.reduce((acc, h) => acc + h.estimatedValue, 0);

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightKg > 0) {
      addStockToHub(category, name, weightKg);
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Aggregation Hub Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">
                Local Aggregation Hub Stock: {collector.aggregationHub}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                MoEFCC Certified Depot
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated dry waste ready for direct refinery auction • Bypassing unorganized middlemen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Log Weighed Stock</span>
          </button>
          <button
            onClick={onOpenCreateTender}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Boxes className="w-4 h-4" />
            <span>Auction Bulk Lot to Recyclers</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stock KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Total Depot Mass</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {(totalInventoryWeightKg / 1000).toFixed(2)} MT
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{totalInventoryWeightKg.toLocaleString()} kg stored</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Warehouse Valuation</span>
          <span className="text-xl font-bold font-mono text-teal-300">
            ₹{totalValuation.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">MCX spot liquidation value</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Sorted Fractions</span>
          <span className="text-xl font-bold font-mono text-amber-300">
            {hubInventory.length} Active Lots
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Moisture & grade verified</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">EPR Eligibility</span>
          <span className="text-xl font-bold font-mono text-blue-400">100% Traceable</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Barcode palletized</span>
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {hubInventory.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                  {item.category}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {item.grade}
                </span>
              </div>
              <h4 className="font-bold text-slate-100 text-sm mb-1">{item.name}</h4>
              <p className="text-xs text-slate-400">
                Minimum industrial reserve threshold: <strong className="text-slate-300">{item.minimumReserveKg} kg</strong>
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Current Stock</span>
                <span className="text-lg font-black font-mono text-emerald-400">
                  {item.currentStockKg.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal ml-0.5">kg</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Est. Market Value</span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  ₹{item.estimatedValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-3">Log Weighed Scrap to Hub Inventory</h3>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Scrap Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ScrapCategory)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <option value="Plastics">Plastics (PET / HDPE / PP)</option>
                  <option value="Metals">Metals (Copper / Aluminum / Iron / Steel)</option>
                  <option value="Paper">Paper & Cartons</option>
                  <option value="EWaste">E-Waste & Electronics</option>
                  <option value="Glass">Glass Bottles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Lot / Material Description:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Weighed Mass (in kg):</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Confirm & Store in Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
