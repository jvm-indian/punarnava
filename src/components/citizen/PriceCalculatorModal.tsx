import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calculator, Droplets, Wind, Trees, ArrowRight, Plus, Trash2 } from 'lucide-react';

interface CartItem {
  itemId: string;
  weight: number;
}

export const PriceCalculatorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking?: (items: { itemId: string; weight: number }[]) => void;
}> = ({ isOpen, onClose, onProceedToBooking }) => {
  const { scrapItems } = useApp();
  const [cart, setCart] = useState<CartItem[]>([
    { itemId: 'paper-news', weight: 15 },
    { itemId: 'plastic-pet', weight: 5 },
    { itemId: 'metal-iron', weight: 10 },
  ]);

  if (!isOpen) return null;

  const handleWeightChange = (itemId: string, weight: number) => {
    setCart((prev) =>
      prev.map((c) => (c.itemId === itemId ? { ...c, weight: Math.max(0, weight) } : c))
    );
  };

  const handleAddItem = (itemId: string) => {
    if (!cart.some((c) => c.itemId === itemId)) {
      setCart((prev) => [...prev, { itemId, weight: 5 }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  };

  // Calculations
  let totalEarnings = 0;
  let totalWaterSaved = 0;
  let totalCo2Avoided = 0;
  let totalTreesSaved = 0;
  let totalWeightKg = 0;

  cart.forEach((c) => {
    const item = scrapItems.find((s) => s.id === c.itemId);
    if (item && c.weight > 0) {
      totalEarnings += item.price * c.weight;
      totalWeightKg += c.weight;
      totalWaterSaved += item.waterSavedPerKg * c.weight;
      totalCo2Avoided += item.co2SavedKg * c.weight;
      totalTreesSaved += item.treesSavedPerKg * c.weight;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Scrap Value & Eco-Impact Calculator</h3>
              <p className="text-xs text-slate-400">
                Calculated in real-time from industrial refinery scrap rates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick item adder */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Add Scrap Category to Estimate:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {scrapItems.map((item) => {
                const inCart = cart.some((c) => c.itemId === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item.id)}
                    disabled={inCart}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1 ${
                      inCart
                        ? 'bg-slate-800 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed'
                        : 'bg-slate-950 hover:bg-emerald-950/60 hover:text-emerald-300 text-slate-300 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{item.name}</span>
                    <span className="font-mono text-emerald-400 font-semibold">₹{item.price}/{item.unit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <div className="grid grid-cols-12 gap-2 p-3 bg-slate-800/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-5">Item / Category</div>
              <div className="col-span-3 text-center">Rate</div>
              <div className="col-span-3 text-center">Est. Weight</div>
              <div className="col-span-1 text-right"></div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {cart.map((c) => {
                const item = scrapItems.find((s) => s.id === c.itemId);
                if (!item) return null;
                const subtotal = item.price * c.weight;

                return (
                  <div key={c.itemId} className="grid grid-cols-12 gap-2 p-3 items-center text-xs">
                    <div className="col-span-5">
                      <p className="font-semibold text-slate-200">{item.name}</p>
                      <span className="text-[10px] text-slate-500">{item.category}</span>
                    </div>

                    <div className="col-span-3 text-center font-mono text-emerald-400 font-bold">
                      ₹{item.price} <span className="text-slate-500 font-normal text-[10px]">/{item.unit}</span>
                    </div>

                    <div className="col-span-3 flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={c.weight}
                        onChange={(e) => handleWeightChange(c.itemId, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-center font-mono text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      <span className="text-slate-400 text-[11px]">{item.unit}</span>
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => handleRemoveItem(c.itemId)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {cart.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No scrap items selected. Click buttons above to add items to your calculator.
                </div>
              )}
            </div>
          </div>

          {/* Results Summary & Eco-Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cash Earnings */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30">
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                Total Estimated Cashout
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-300 mt-1">
                ₹{totalEarnings.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                For approx <strong className="text-slate-200">{totalWeightKg.toFixed(1)} kg</strong> dry recyclable waste
              </p>
            </div>

            {/* Environmental Impact Savings */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Your Environmental Savings
              </span>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-900/40">
                  <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs font-bold font-mono text-blue-300">{Math.round(totalWaterSaved)}L</div>
                  <span className="text-[9px] text-slate-400">Water Saved</span>
                </div>
                <div className="p-2 rounded-lg bg-teal-950/40 border border-teal-900/40">
                  <Wind className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                  <div className="text-xs font-bold font-mono text-teal-300">{totalCo2Avoided.toFixed(1)}kg</div>
                  <span className="text-[9px] text-slate-400">CO₂ Avoided</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/40">
                  <Trees className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs font-bold font-mono text-emerald-300">{totalTreesSaved.toFixed(2)}</div>
                  <span className="text-[9px] text-slate-400">Trees Spared</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Close Calculator
          </button>
          {onProceedToBooking && (
            <button
              onClick={() => {
                onProceedToBooking(cart);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950 transition-all hover:scale-[1.02]"
            >
              <span>Schedule Pickup with this List</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
