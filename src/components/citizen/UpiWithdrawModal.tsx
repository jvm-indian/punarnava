import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WalletTransaction } from '../../types';

interface UpiWithdrawModalProps {
  onClose: () => void;
  onOpenPassbook?: () => void;
}

const POPULAR_UPI_HANDLES = [
  '@okaxis',
  '@okhdfcbank',
  '@okicici',
  '@oksbi',
  '@paytm',
  '@ybl',
];

export const UpiWithdrawModal: React.FC<UpiWithdrawModalProps> = ({
  onClose,
  onOpenPassbook,
}) => {
  const { walletBalance, withdrawToUpi, currentUser } = useApp();

  const [amountStr, setAmountStr] = useState<string>(
    walletBalance > 0 ? Math.min(walletBalance, 1000).toString() : '0'
  );
  const [upiId, setUpiId] = useState<string>('ananya.sharma@okaxis');
  const [note, setNote] = useState<string>('Doorstep Scrap Monetization');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Transaction simulation steps
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [successTxn, setSuccessTxn] = useState<WalletTransaction | null>(null);
  const [copiedUtr, setCopiedUtr] = useState(false);

  const numericAmount = parseFloat(amountStr) || 0;

  const handlePresetAmount = (preset: number | 'all') => {
    if (preset === 'all') {
      setAmountStr(walletBalance.toFixed(0));
    } else {
      setAmountStr(Math.min(walletBalance, preset).toString());
    }
    setErrorMsg(null);
  };

  const handleAppendHandle = (handle: string) => {
    const atIndex = upiId.indexOf('@');
    if (atIndex > 0) {
      setUpiId(upiId.substring(0, atIndex) + handle);
    } else if (upiId.trim().length > 0) {
      setUpiId(upiId.trim() + handle);
    } else {
      setUpiId('user' + handle);
    }
  };

  const handleCopyUtr = (utr: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(utr);
      setCopiedUtr(true);
      setTimeout(() => setCopiedUtr(false), 2000);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numericAmount <= 0) {
      setErrorMsg('Please enter a withdrawal amount greater than ₹0.');
      return;
    }

    if (numericAmount > walletBalance) {
      setErrorMsg(`Withdrawal amount exceeds available wallet balance of ₹${walletBalance.toFixed(2)}.`);
      return;
    }

    if (!upiId.includes('@') || upiId.trim().length < 5) {
      setErrorMsg('Please enter a valid UPI ID (Virtual Payment Address, e.g. name@okhdfcbank).');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStep(1);

      // Simulated step transitions for realistic banking progress
      const stepTimer1 = setTimeout(() => setProcessingStep(2), 600);
      const stepTimer2 = setTimeout(() => setProcessingStep(3), 1200);

      const res = await withdrawToUpi(numericAmount, upiId.trim(), note);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setSuccessTxn(res.transaction);
      setIsProcessing(false);

      // Trigger celebratory confetti on instant transfer
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#ffffff'],
      });
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : 'Transaction failed. Please try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-100">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Instant UPI Withdrawal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NPCI 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct bank payout from scrap sales • 0% Transaction Fee
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* State 1: Transaction Success Receipt */}
        {successTxn ? (
          <div className="py-4 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-9 h-9" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                Instant UPI Transfer Disbursed
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                ₹{successTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400">
                Credited directly to <span className="font-mono text-emerald-400 font-bold">{successTxn.upiId}</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Bank / Service:</span>
                <span className="font-semibold text-slate-200">{successTxn.bankName || 'Verified Bank'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Bank UTR Reference:</span>
                <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                  <span>{successTxn.referenceId}</span>
                  <button
                    onClick={() => handleCopyUtr(successTxn.referenceId)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                    title="Copy UTR Reference"
                  >
                    {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Timestamp:</span>
                <span className="font-mono text-slate-300">
                  {new Date(successTxn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })},{' '}
                  {new Date(successTxn.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-800">
                <span>Updated Wallet Balance:</span>
                <span className="font-mono font-bold text-slate-200">
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenPassbook) {
                    onClose();
                    onOpenPassbook();
                  } else {
                    onClose();
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Wallet Passbook</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                Done
              </button>
            </div>
          </div>
        ) : isProcessing ? (
          /* State 2: Simulated Live Banking Gateway Progress */
          <div className="py-10 space-y-6 text-center animate-in fade-in duration-150">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white">
                {processingStep === 1 && 'Connecting to NPCI Bank Gateway...'}
                {processingStep === 2 && 'Validating UPI VPA & Escrow Escort...'}
                {processingStep === 3 && 'Authorizing Instant 24x7 IMPS Payout...'}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Disbursing ₹{numericAmount.toFixed(2)} to {upiId}
              </p>
            </div>

            {/* Stepper indicators */}
            <div className="max-w-xs mx-auto space-y-2 text-left text-xs bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <span className={`w-2 h-2 rounded-full ${processingStep >= 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span>1. Handshake with UPI Payment Switch</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className={`w-2 h-2 rounded-full ${processingStep >= 2 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span>2. Name & VPA Validation on Registry</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className={`w-2 h-2 rounded-full ${processingStep >= 3 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span>3. Issuing 12-Digit Banking UTR</span>
              </div>
            </div>
          </div>
        ) : (
          /* State 3: Withdrawal Form */
          <form onSubmit={handleSubmitWithdrawal} className="py-4 space-y-5">
            {/* Wallet Available Balance Summary Strip */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Available Wallet Balance
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handlePresetAmount('all')}
                disabled={walletBalance <= 0}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all disabled:opacity-40"
              >
                Withdraw All
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Withdrawal Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max={walletBalance}
                  step="any"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Preset Amount Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[500, 1000, 2500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={walletBalance < preset}
                    onClick={() => handlePresetAmount(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      numericAmount === preset
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={walletBalance <= 0}
                  onClick={() => handlePresetAmount('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    numericAmount === walletBalance && walletBalance > 0
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30'
                  }`}
                >
                  Full Balance
                </button>
              </div>
            </div>

            {/* UPI ID (VPA) Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">
                  Recipient UPI ID (Virtual Payment Address)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">GPay / PhonePe / Paytm</span>
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="username@bankhandle"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />

              {/* Quick UPI Provider Handles */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 mr-1">Quick handle:</span>
                {POPULAR_UPI_HANDLES.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => handleAppendHandle(handle)}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition-colors"
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional transfer note */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                Remark / Reference Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. October Scrap Earnings"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-slate-600"
              />
            </div>

            {/* Trust and Escrow guarantee indicator */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong className="text-emerald-400 font-semibold">100% Protected IMPS Payout:</strong> Funds are disbursed instantly from Punarnava&apos;s verified escrow pool with zero commission fee.
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={walletBalance <= 0 || numericAmount <= 0 || numericAmount > walletBalance}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>
                  Withdraw ₹{numericAmount > 0 ? numericAmount.toLocaleString('en-IN') : '0'} to UPI
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
