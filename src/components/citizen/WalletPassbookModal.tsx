import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Search,
  Filter,
  Copy,
  Check,
  CheckCircle,
  ExternalLink,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { WalletTransactionType } from '../../types';

interface WalletPassbookModalProps {
  onClose: () => void;
  onOpenWithdraw?: () => void;
}

export const WalletPassbookModal: React.FC<WalletPassbookModalProps> = ({
  onClose,
  onOpenWithdraw,
}) => {
  const { walletTransactions, walletBalance, totalEarningsFromScrap, totalWithdrawnToUpi } = useApp();
  const [filterType, setFilterType] = useState<'all' | WalletTransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTransactions = walletTransactions.filter((txn) => {
    if (filterType !== 'all' && txn.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = txn.title.toLowerCase().includes(q);
      const matchRef = txn.referenceId.toLowerCase().includes(q);
      const matchUpi = txn.upiId?.toLowerCase().includes(q) || false;
      return matchTitle || matchRef || matchUpi;
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Scrap Wallet Passbook & UTR Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Transparent cryptographic record of all scrap sale credits and bank transfers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close passbook"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 shrink-0">
          {/* Current Balance */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Available Balance
            </span>
            <span className="text-xl font-black font-mono text-emerald-400">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Total Credited */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lifetime Scrap Sold</span>
            </div>
            <span className="text-xl font-bold font-mono text-slate-200">
              ₹{totalEarningsFromScrap.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Total Withdrawn */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Withdrawn via UPI</span>
            </div>
            <span className="text-xl font-bold font-mono text-slate-200">
              ₹{totalWithdrawnToUpi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({walletTransactions.length})
            </button>
            <button
              onClick={() => setFilterType('scrap_credit')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'scrap_credit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scrap Sold (+)
            </button>
            <button
              onClick={() => setFilterType('upi_withdrawal')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'upi_withdrawal'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UPI Payouts (-)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order or UTR..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 w-full sm:w-56"
            />
          </div>
        </div>

        {/* Scrollable Transactions List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800/60 my-4">
              No transactions matching your criteria.
            </div>
          ) : (
            filteredTransactions.map((txn) => {
              const isCredit = txn.type === 'scrap_credit';
              return (
                <div
                  key={txn.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs sm:text-sm">
                          {txn.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-cyan-500/10 text-cyan-400'
                          }`}
                        >
                          {isCredit ? 'CREDIT' : 'DEBIT'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">
                        {txn.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 pt-0.5">
                        <span>
                          {new Date(txn.timestamp).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(txn.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <span>Ref: {txn.referenceId}</span>
                          <button
                            onClick={() => handleCopy(txn.id, txn.referenceId)}
                            className="p-0.5 text-slate-500 hover:text-slate-300"
                            title="Copy reference"
                          >
                            {copiedId === txn.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span
                      className={`text-base sm:text-lg font-black font-mono ${
                        isCredit ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹
                      {txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-semibold flex items-center gap-1 sm:justify-end">
                      <CheckCircle className="w-3 h-3 inline" />
                      <span>Settled</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            🔒 Protected by Bank-Grade 256-Bit TLS Encryption
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </button>
            {onOpenWithdraw && walletBalance > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWithdraw();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Withdraw to UPI</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
