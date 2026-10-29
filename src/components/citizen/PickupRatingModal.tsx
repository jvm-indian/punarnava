import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';
import {
  Star,
  ShieldCheck,
  Check,
  Heart,
  Sparkles,
  X,
  CreditCard,
  MessageSquare,
  ThumbsUp,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PickupRatingModalProps {
  pickup: PickupRequest;
  onClose: () => void;
}

const RATING_SENTIMENTS: Record<number, { title: string; subtitle: string; color: string }> = {
  1: {
    title: 'Needs Improvement',
    subtitle: 'We apologize for your poor experience. Your feedback helps us audit partner conduct.',
    color: 'text-rose-400',
  },
  2: {
    title: 'Below Expectations',
    subtitle: 'The collection fell short of Punarnava quality and digital weighing standards.',
    color: 'text-amber-400',
  },
  3: {
    title: 'Satisfactory / Okay',
    subtitle: 'Scrap collection was completed according to standard procedures.',
    color: 'text-yellow-400',
  },
  4: {
    title: 'Very Good & Punctual',
    subtitle: 'Collector was polite, weighed accurately, and settled payout promptly.',
    color: 'text-emerald-400',
  },
  5: {
    title: 'Exceptional Service! 🌟',
    subtitle: 'Flawless experience: on-time arrival, certified Bluetooth scale, and instant payment!',
    color: 'text-emerald-300',
  },
};

const COMPLIMENT_TAGS = [
  { id: 'scale', label: '⚖️ 100% Accurate Scale' },
  { id: 'punctual', label: '⏱️ On-Time Arrival' },
  { id: 'polite', label: '🤝 Polite & Professional' },
  { id: 'upi', label: '⚡ Instant UPI Payment' },
  { id: 'uniform', label: '🛡️ CPCB Uniform & ID' },
  { id: 'segregation', label: '🧹 Clean Sorting & Packing' },
  { id: 'bill', label: '📱 Transparent Digital Bill' },
  { id: 'fair_rate', label: '💰 Fair Refinery Spot Rates' },
];

const TIP_OPTIONS = [
  { amount: 0, label: 'No Tip' },
  { amount: 20, label: '₹20 (Tea & Snack)' },
  { amount: 50, label: '₹50 (Green Bonus)' },
  { amount: 100, label: '₹100 (Hero Saver)' },
];

export const PickupRatingModal: React.FC<PickupRatingModalProps> = ({ pickup, onClose }) => {
  const { collector, ratePickupCollector, currentUser } = useApp();

  const [rating, setRating] = useState<number>(pickup.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(pickup.review || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    pickup.feedbackTags || ['Accurate Scale', 'Punctual Arrival', 'Instant UPI Payment']
  );
  const [tipAmount, setTipAmount] = useState<number>(pickup.tipAmount || 0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  const activeRatingDisplay = hoverRating || rating;
  const sentiment = RATING_SENTIMENTS[activeRatingDisplay] || RATING_SENTIMENTS[5];

  const toggleTag = (tagLabel: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel) ? prev.filter((t) => t !== tagLabel) : [...prev, tagLabel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await ratePickupCollector(
        pickup.id,
        pickup.collectorId || collector.id,
        rating,
        feedback.trim() || 'Prompt doorstep pickup with transparent scale reading and instant digital payout.',
        selectedTags,
        tipAmount
      );

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#f59e0b', '#ffffff'],
      });

      setIsSubmittedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmittedSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-white">Rating Recorded & Verified!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your feedback directly updates {collector.name}&apos;s public profile in the PUNARNAVA trust ledger.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CPCB Partner Ledger Synchronized</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header / Collector Badge */}
            <div className="flex items-start gap-4 pr-8">
              <div className="relative shrink-0">
                <img
                  src={collector.avatar}
                  alt={collector.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-md shadow-emerald-950"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-950" title="CPCB Verified Partner">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Rate Pickup Experience</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Order #{pickup.id}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Partner: <strong className="text-slate-100">{collector.name}</strong> • {collector.vehicleType}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-amber-300 font-mono font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{collector.rating}</span>
                  </span>
                  <span>({collector.totalReviews} reviews)</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">{collector.badgeTier}</span>
                </div>
              </div>
            </div>

            {/* Interactive Star Rating Selector */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-center space-y-3">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block">
                How would you rate the service?
              </span>

              {/* Star buttons */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = starValue <= activeRatingDisplay;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 sm:p-2 rounded-xl hover:scale-110 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      aria-label={`${starValue} Stars`}
                    >
                      <Star
                        className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors duration-150 ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                            : 'text-slate-700 hover:text-slate-500'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Sentiment Caption */}
              <div className="min-h-[44px] flex flex-col justify-center">
                <p className={`text-base font-extrabold ${sentiment.color}`}>
                  {sentiment.title}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {sentiment.subtitle}
                </p>
              </div>
            </div>

            {/* Quick Service Compliments (Chips) */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>What did {collector.name.split(' ')[0]} do well?</span>
                <span className="text-[10px] text-slate-500 font-normal">Select all that apply</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {COMPLIMENT_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.label);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Review Feedback */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Detailed Feedback & Experience</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {feedback.length}/300 characters
                </span>
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Share your experience (e.g., promptness, accuracy of digital weighing, polite behavior)..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Optional Green Appreciation Tip */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                  <span>Green Hero Appreciation Tip (Optional)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">100% goes to collector</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {TIP_OPTIONS.map((tip) => (
                  <button
                    key={tip.amount}
                    type="button"
                    onClick={() => setTipAmount(tip.amount)}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      tipAmount === tip.amount
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Guarantee Footer */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-slate-300 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Verified Trust Network:</strong> Ratings directly impact collector tier incentives from industrial recyclers, promoting transparency and eliminating exploitative cartel practices.
              </span>
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Updating Ledger...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Submit Verified Rating</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
