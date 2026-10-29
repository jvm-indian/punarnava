import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Star,
  ShieldCheck,
  Award,
  CheckCircle,
  ThumbsUp,
  X,
  User,
  Heart,
  Calendar,
} from 'lucide-react';

interface CollectorReviewsDrawerProps {
  onClose: () => void;
  onOpenRate?: () => void;
}

export const CollectorReviewsDrawer: React.FC<CollectorReviewsDrawerProps> = ({
  onClose,
  onOpenRate,
}) => {
  const { collector } = useApp();

  const totalReviews = collector.totalReviews || 1248;
  const rating = collector.rating || 4.9;
  const breakdown = collector.ratingBreakdown || {
    5: 1142,
    4: 86,
    3: 15,
    2: 4,
    1: 1,
  };

  const reviewsList = collector.recentReviews || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={collector.avatar}
                alt={collector.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shadow-emerald-950"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-950" title="CPCB Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{collector.name}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {collector.badgeTier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {collector.vehicleType} • <span className="font-mono text-emerald-400 font-semibold">{collector.vehiclePlate}</span>
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Police Verified ({collector.policeVerificationDate})</span>
                </span>
                <span>•</span>
                <span>Hub: {collector.aggregationHub}</span>
              </div>
            </div>
          </div>

          {onOpenRate && (
            <button
              onClick={() => {
                onClose();
                onOpenRate();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>Rate This Partner</span>
            </button>
          )}
        </div>

        {/* Aggregate Ratings Overview & Star Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
          {/* Big Score */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-3 sm:border-r border-slate-800/80">
            <span className="text-4xl sm:text-5xl font-black font-mono text-amber-300 flex items-center gap-1">
              <span>{rating.toFixed(1)}</span>
              <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-300 text-amber-300 mb-1" />
            </span>
            <div className="flex items-center gap-1 my-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-slate-300 mt-1">
              Based on <strong className="text-white font-mono">{totalReviews.toLocaleString()}</strong> verified pickups
            </p>
            <span className="text-[11px] text-emerald-400 mt-1 font-semibold">
              98% of citizens recommend {collector.name.split(' ')[0]}
            </span>
          </div>

          {/* Breakdown Bars */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = breakdown[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = Math.round((count / totalReviews) * 100);

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <div className="w-10 font-mono text-slate-300 flex items-center gap-0.5 justify-end">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stars >= 4
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : stars === 3
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-12 text-right font-mono text-[11px] text-slate-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Reviews Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Verified Household Feedback</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({reviewsList.length} recent)
              </span>
            </h4>
            <span className="text-[11px] text-emerald-400 font-medium">
              Doorstep Verified
            </span>
          </div>

          <div className="space-y-3">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                      {rev.citizenName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-200">
                          {rev.citizenName}
                        </span>
                        {rev.citizenPhoneMasked && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {rev.citizenPhoneMasked}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Order #{rev.pickupId} • {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-300 ml-1">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-10">
                  &ldquo;{rev.feedback}&rdquo;
                </p>

                {/* Tags and Tip Badge */}
                <div className="flex flex-wrap items-center gap-1.5 pl-10 pt-1">
                  {rev.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-medium text-emerald-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {rev.tipAmount && rev.tipAmount > 0 ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-950/40 border border-rose-900/40 text-[10px] font-medium text-rose-300 flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                      <span>₹{rev.tipAmount} Tip Given</span>
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs text-slate-400">
          <span>CPCB Registered Node #DL-EPR-2026-992</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
