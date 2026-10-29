import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupRequest, PickupItem } from '../../types';
import {
  X,
  Scale,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DoorstepHandOffModal: React.FC<{
  pickup: PickupRequest;
  isOpen: boolean;
  onClose: () => void;
}> = ({ pickup, isOpen, onClose }) => {
  const {
    scaleState,
    verifyPickupOtpAndComplete,
    tareScale,
    lockScaleReading,
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [items, setItems] = useState<PickupItem[]>(
    pickup.items.map((it) => ({
      ...it,
      verifiedWeight: it.verifiedWeight ?? it.estimatedWeight,
    }))
  );
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [selectedPayout, setSelectedPayout] = useState<'UPI' | 'Unified Wallet' | 'Cash'>('UPI');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [payoutResult, setPayoutResult] = useState<number>(0);

  if (!isOpen) return null;

  const handleApplyScaleWeightToCurrentItem = () => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === activeItemIndex ? { ...it, verifiedWeight: scaleState.currentWeight } : it))
    );
  };

  const handleManualWeightChange = (index: number, weight: number) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, verifiedWeight: Math.max(0, weight) } : it))
    );
  };

  const totalCalculatedPayout = items.reduce((acc, it) => {
    const weight = it.verifiedWeight ?? it.estimatedWeight;
    return acc + weight * it.ratePerUnit;
  }, 0);

  const totalWeighedKg = items.reduce((acc, it) => acc + (it.verifiedWeight ?? it.estimatedWeight), 0);

  const handleVerifyAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = verifyPickupOtpAndComplete(pickup.id, enteredOtp, items, selectedPayout);

    if (result.success) {
      setIsSuccess(true);
      setPayoutResult(result.payoutAmount || totalCalculatedPayout);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">Doorstep Weighing & OTP Terminal</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {pickup.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Customer: <strong className="text-white">{pickup.customerName}</strong> • {pickup.customerAddress}
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

        {isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Hand-off Verified & Payout Dispatched!</h2>
              <p className="text-sm text-slate-300">
                Doorstep OTP confirmed. Total weight of <strong className="text-emerald-300 font-mono">{totalWeighedKg.toFixed(1)} kg</strong> recorded.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 max-w-sm mx-auto space-y-2">
              <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider block">
                Instant Digital Settlement
              </span>
              <div className="text-4xl font-extrabold font-mono text-emerald-300">
                ₹{payoutResult.toFixed(0)}
              </div>
              <p className="text-xs text-slate-400">
                Transferred via <strong>{selectedPayout}</strong> to customer account
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                Txn Hash: 0x8A92... • Inventory added to Indiranagar Hub
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950"
            >
              Back to Route Navigation
            </button>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleVerifyAndPay} className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Live Bluetooth Scale Reader Strip */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${scaleState.isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Smart Scale BLE:</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {scaleState.isConnected ? 'CONNECTED' : 'STANDALONE'}
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {scaleState.currentWeight.toFixed(2)} kg
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={tareScale}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-emerald-400" />
                  <span>Tare (0.0)</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyScaleWeightToCurrentItem}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sync to Selected Item</span>
                </button>
              </div>
            </div>

            {/* Itemized Weighing Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Itemized Scrap Weight Verification:
                </label>
                <span className="text-[11px] text-slate-400">
                  Select an item row to sync from scale
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                <div className="grid grid-cols-12 gap-2 p-2.5 bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase">
                  <div className="col-span-5">Material</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-3 text-center">Verified Wt (kg)</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {items.map((it, idx) => {
                    const isRowActive = activeItemIndex === idx;
                    const wt = it.verifiedWeight ?? it.estimatedWeight;
                    const subtotal = wt * it.ratePerUnit;

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveItemIndex(idx)}
                        className={`grid grid-cols-12 gap-2 p-3 items-center text-xs cursor-pointer transition-colors ${
                          isRowActive
                            ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500'
                            : 'hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="col-span-5">
                          <p className="font-semibold text-slate-200">{it.itemName}</p>
                          <span className="text-[10px] text-slate-500">Est: {it.estimatedWeight} kg</span>
                        </div>

                        <div className="col-span-2 text-center font-mono text-emerald-400">
                          ₹{it.ratePerUnit}
                        </div>

                        <div className="col-span-3 flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={wt}
                            onChange={(e) => handleManualWeightChange(idx, parseFloat(e.target.value) || 0)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-center font-mono font-bold text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400">kg</span>
                        </div>

                        <div className="col-span-2 text-right font-mono font-bold text-emerald-300">
                          ₹{subtotal.toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Total Payout Summary */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold block">
                  Final Weighed Payout Amount
                </span>
                <span className="text-2xl font-black font-mono text-emerald-300">
                  ₹{totalCalculatedPayout.toFixed(0)}
                </span>
              </div>
              <div className="text-right text-xs text-slate-400">
                <span className="block font-medium text-slate-200">{totalWeighedKg.toFixed(1)} kg Total Scrap</span>
                <span>Includes fair-trade rate guarantee</span>
              </div>
            </div>

            {/* Customer's 4-Digit Doorstep OTP Input */}
            <div className="p-4 rounded-xl bg-slate-950 border-2 border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Enter 4-Digit Customer OTP:</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  (Shown on {pickup.customerName}'s screen)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 4829"
                  className="w-40 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono text-2xl font-black tracking-widest text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
                <div className="text-xs text-slate-400 leading-snug">
                  Ask customer: <em>"Please share the OTP on your PUNARNAVA screen to confirm weight and receive instant payment."</em>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Payout Channel Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Release Payment Through:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'Unified Wallet', 'Cash'] as const).map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setSelectedPayout(method)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedPayout === method
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {method === 'UPI' ? '⚡ Instant UPI' : method === 'Unified Wallet' ? '👛 PUNARNAVA Wallet' : '💵 Cash Handover'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Verify OTP & Disburse ₹{totalCalculatedPayout.toFixed(0)}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
