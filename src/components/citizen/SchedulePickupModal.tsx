import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PickupItem } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  Camera,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SchedulePickupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialItems?: { itemId: string; weight: number }[];
}> = ({ isOpen, onClose, initialItems }) => {
  const { scrapItems, createPickupRequest } = useApp();

  const [customerName, setCustomerName] = useState('Ananya Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 98711 54321');
  const [customerAddress, setCustomerAddress] = useState('Flat 402, Oakwood Heights, Sector 4');
  const [landmark, setLandmark] = useState('Opposite Sector 4 Metro Pillar 112');
  const [city, setCity] = useState('New Delhi / NCR');
  const [weightTier, setWeightTier] = useState<'0-10 kg' | '10-50 kg' | 'Bulk (>50 kg)'>('10-50 kg');
  const [preferredSlot, setPreferredSlot] = useState('Today, 10:00 AM - 12:00 PM');
  const [scheduledDate, setScheduledDate] = useState('2026-10-29');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Unified Wallet' | 'Cash'>('UPI');
  const [upiId, setUpiId] = useState('ananya.sharma@okaxis');
  const [notes, setNotes] = useState('Scrap is packed in cartons in the garage. Please ring doorbell #402.');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=200&auto=format&fit=crop&q=80',
  ]);

  // Selected items state
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; estimatedWeight: number }[]>(
    initialItems && initialItems.length > 0
      ? initialItems.map((i) => ({ itemId: i.itemId, estimatedWeight: i.weight }))
      : [
          { itemId: 'paper-news', estimatedWeight: 18 },
          { itemId: 'plastic-pet', estimatedWeight: 6 },
          { itemId: 'metal-ss', estimatedWeight: 4 },
        ]
  );

  if (!isOpen) return null;

  const toggleItem = (itemId: string) => {
    if (selectedItems.some((s) => s.itemId === itemId)) {
      setSelectedItems((prev) => prev.filter((s) => s.itemId !== itemId));
    } else {
      setSelectedItems((prev) => [...prev, { itemId, estimatedWeight: 5 }]);
    }
  };

  const handleWeightChange = (itemId: string, weight: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.itemId === itemId ? { ...s, estimatedWeight: Math.max(0.5, weight) } : s))
    );
  };

  const calculateTotalEstimate = () => {
    return selectedItems.reduce((acc, curr) => {
      const item = scrapItems.find((s) => s.id === curr.itemId);
      return acc + (item ? item.price * curr.estimatedWeight : 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pickupItemsList: PickupItem[] = selectedItems.map((s) => {
      const itemMeta = scrapItems.find((item) => item.id === s.itemId);
      return {
        itemId: s.itemId,
        itemName: itemMeta ? itemMeta.name : s.itemId,
        category: itemMeta ? itemMeta.category : 'Paper',
        estimatedWeight: s.estimatedWeight,
        ratePerUnit: itemMeta ? itemMeta.price : 15,
      };
    });

    createPickupRequest({
      customerName,
      customerPhone,
      customerAddress,
      landmark,
      city,
      lat: 28.5355,
      lng: 77.2410,
      items: pickupItemsList,
      preferredSlot,
      scheduledDate,
      totalEstimatedValue: calculateTotalEstimate(),
      payoutMethod,
      upiId: payoutMethod === 'UPI' ? upiId : undefined,
      notes,
      photos: uploadedPhotos,
    });

    onClose();
  };

  const addSimulatedPhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=200&auto=format&fit=crop&q=80',
    ];
    const pick = samples[uploadedPhotos.length % samples.length];
    setUploadedPhotos([...uploadedPhotos, pick]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Schedule Doorstep Scrap Collection</h3>
              <p className="text-xs text-slate-400">
                Verified Kabadiwala with Bluetooth digital scale will arrive at your door
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Weight Tier Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Approximate Scrap Weight Tier:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['0-10 kg', '10-50 kg', 'Bulk (>50 kg)'] as const).map((tier) => (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setWeightTier(tier)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    weightTier === tier
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-200">{tier}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {tier === '0-10 kg'
                      ? 'Small household pile'
                      : tier === '10-50 kg'
                      ? 'Cartons & newspaper bundle'
                      : 'Workshop / Renovation bulk'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Select Scrap Items */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Scrap Materials:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {scrapItems.map((item) => {
                const isSelected = selectedItems.some((s) => s.itemId === item.id);
                const currentWeight = selectedItems.find((s) => s.itemId === item.id)?.estimatedWeight || 5;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800/80 border-emerald-500/60'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="text-left flex-1"
                      >
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1">{item.name}</p>
                        <span className="text-[10px] font-mono text-emerald-400">₹{item.price}/{item.unit}</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.id)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 mt-0.5"
                      />
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-700/60">
                        <span className="text-[10px] text-slate-400">Est.</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={currentWeight}
                          onChange={(e) => handleWeightChange(item.id, parseFloat(e.target.value) || 1)}
                          className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono text-emerald-300"
                        />
                        <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Slot & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Date:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Time Slot:
              </label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Today, 10:00 AM - 12:00 PM">Today, 10:00 AM - 12:00 PM (Morning)</option>
                <option value="Today, 01:00 PM - 03:00 PM">Today, 01:00 PM - 03:00 PM (Afternoon)</option>
                <option value="Today, 04:00 PM - 06:00 PM">Today, 04:00 PM - 06:00 PM (Evening)</option>
                <option value="Tomorrow, 10:00 AM - 12:00 PM">Tomorrow, 10:00 AM - 12:00 PM</option>
              </select>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Doorstep Pickup Address:
              </label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="House / Flat No, Society or Street"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Landmark:
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Pillar / Temple"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Contact Mobile Number:
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Item Photos (simulated upload) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Scrap Photos (Optional verification):
              </label>
              <button
                type="button"
                onClick={addSimulatedPhoto}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Add Photo</span>
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {uploadedPhotos.map((imgUrl, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0 group">
                  <img src={imgUrl} alt="Scrap preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-slate-950/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instant Payout Method */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Instant Payout Preference:
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['UPI', 'Unified Wallet', 'Cash'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPayoutMethod(m)}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    payoutMethod === m
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {m === 'UPI' ? '⚡ UPI Instant' : m === 'Unified Wallet' ? '👛 PUNARNAVA Wallet' : '💵 Cash Hand-off'}
                </button>
              ))}
            </div>

            {payoutMethod === 'UPI' && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Enter your UPI VPA handle for instant credit:</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Total Value Preview Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold block">
                Estimated Doorstep Cashout
              </span>
              <span className="text-xl font-bold font-mono text-emerald-300">
                ₹{calculateTotalEstimate().toLocaleString()}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span className="block font-medium text-slate-300">{selectedItems.length} Materials</span>
              <span>Paid instantly on OTP verification</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirm & Dispatch Nearest Kabadiwala</span>
          </button>
        </form>
      </div>
    </div>
  );
};
