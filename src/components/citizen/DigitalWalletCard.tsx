import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Zap,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface DigitalWalletCardProps {
  onOpenWithdraw: () => void;
  onOpenPassbook: () => void;
  pendingAmount?: number;
}

export const DigitalWalletCard: React.FC<DigitalWalletCardProps> = ({
  onOpenWithdraw,
  onOpenPassbook,
  pendingAmount = 0,
}) => {
  const {
    walletBalance,
    walletTransactions,
    totalEarningsFromScrap,
    totalWithdrawnToUpi,
  } = useApp();

  const latestTransaction = walletTransactions[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/35 p-6 sm:p-7 shadow-2xl">
      {/* Decorative ambient background blurs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Balance & Branding */}
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/25">
              <Wallet className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono">
                  Digital Scrap Wallet
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant UPI Active
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Scrap Monetization Balance
              </h3>
            </div>
          </div>

          {/* Large Hero Balance Display */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-300">
                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-emerald-400 font-medium">INR</span>
            </div>
            <p className="text-xs text-slate-400">
              Current available earnings from certified doorstep weigh-ins • 100% withdrawable to any UPI app
            </p>
          </div>

          {/* Metric Trio Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Lifetime Scrap Sold */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                <span>Total Scrap Sold</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                ₹{totalEarningsFromScrap.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
            </div>

            {/* Withdrawn to UPI */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                <span>Withdrawn to Bank</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                ₹{totalWithdrawnToUpi.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
            </div>

            {/* In-Transit Escrow */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Active Pickup Est.</span>
              </div>
              <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action CTA Buttons & Recent Activity Ticker */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
          {/* Primary Withdraw to UPI Button */}
          <button
            type="button"
            onClick={onOpenWithdraw}
            disabled={walletBalance <= 0}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950 group-hover:animate-bounce" />
            <span>Withdraw to UPI</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary Passbook Button */}
          <button
            type="button"
            onClick={onOpenPassbook}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-xs transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>View Passbook & UTRs ({walletTransactions.length})</span>
          </button>

          {/* Mini Recent Transaction Badge */}
          {latestTransaction && (
            <div
              onClick={onOpenPassbook}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-emerald-500/30 transition-colors cursor-pointer text-left space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-500">
                  Latest Transaction
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {latestTransaction.type === 'scrap_credit' ? '+' : '-'}₹
                  {latestTransaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium line-clamp-1">
                {latestTransaction.title}
              </p>
              <span className="text-[9px] font-mono text-slate-500 block">
                Ref: {latestTransaction.referenceId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Trust & Escrow Guarantee Footer Strip */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NPCI 2.0 Real-Time Settlement</span>
          <span className="text-slate-600">•</span>
          <span>Zero Processing Fees</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Escrow Protected</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">24x7 Instant Transfer</span>
        </div>
      </div>
    </div>
  );
};
