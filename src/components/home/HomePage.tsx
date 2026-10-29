import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, VehicleTier, ScrapCategory } from '../../types';
import { ElectricRickshawScene } from '../3d/ElectricRickshawScene';
import { AiScrapIntelligence } from './AiScrapIntelligence';
import {
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Leaf,
  DollarSign,
  Truck,
  Calculator,
  ChevronRight,
  Shield,
  Smartphone,
  Calendar,
  Building2,
  FileCheck2,
  Car,
  Search,
  Star,
  Award,
  PhoneCall,
  Recycle,
  Users,
} from 'lucide-react';

export const HomePage: React.FC<{
  onOpenRegister: (role: UserRole) => void;
  onOpenCalculator: () => void;
  onNavigateToDashboard: (role: UserRole) => void;
}> = ({ onOpenRegister, onOpenCalculator, onNavigateToDashboard }) => {
  const {
    currentUser,
    isAuthenticated,
    setIsLoginModalOpen,
    scrapItems,
    selectedCity,
    showToast,
  } = useApp();

  // Booking form state on the hero section
  const [selectedScrapType, setSelectedScrapType] = useState<string>('Paper & Books');
  const [addressPincode, setAddressPincode] = useState('Sector 4, Arera Colony');
  const [weightEstimate, setWeightEstimate] = useState<string>('15 - 50 kg');
  const [searchItemQuery, setSearchItemQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScrapCategory | 'All'>('All');

  const scrapCategoriesList = [
    { label: 'Paper & Books', icon: '📰' },
    { label: 'Plastics & PET', icon: '🧴' },
    { label: 'Metals & Iron', icon: '🔩' },
    { label: 'E-Waste', icon: '💻' },
    { label: 'Appliances', icon: '❄️' },
  ];

  const handleHeroBookClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in or register your citizen account to schedule doorstep pickup.');
      setIsLoginModalOpen(true);
      return;
    }

    if (currentUser?.role === 'citizen') {
      onNavigateToDashboard('citizen');
    } else {
      showToast(`Logged in as ${currentUser?.role}. You can view the Citizen dashboard.`);
      onNavigateToDashboard('citizen');
    }
  };

  const handlePartnerApply = () => {
    if (!isAuthenticated) {
      onOpenRegister('kabadiwala');
      return;
    }
    if (currentUser?.role === 'kabadiwala') {
      onNavigateToDashboard('kabadiwala');
    } else {
      showToast('Please register or log in with a Kabadiwala partner account.');
      onOpenRegister('kabadiwala');
    }
  };

  // Filtered scrap items for rates catalog
  const filteredScrapItems = scrapItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchItemQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION: THE KABADIWALA CLEAN CONSUMER AESTHETIC */}
      <section className="relative pt-4 sm:pt-6">
        <div className="rounded-3xl bg-gradient-to-b from-emerald-50/70 via-white to-slate-50/80 border border-emerald-100/80 p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Trust Badges, and Quick Doorstep Booking Widget */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>India's #1 Doorstep Scrap Pickup Service</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Sell Your Scrap Online for{' '}
                  <span className="text-emerald-600 underline decoration-emerald-300 underline-offset-4">
                    Instant Cash
                  </span>{' '}
                  at Your Doorstep.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  Accurate ISO digital weighing scales, guaranteed transparent market rates, doorstep
                  collection at your preferred time, and instant UPI or Cash payment.
                </p>
              </div>

              {/* Quick Booking Form Card (The Kabadiwala signature hero widget) */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-md shadow-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Schedule Free Doorstep Pickup in {selectedCity}</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    No Pickup Fee
                  </span>
                </div>

                <form onSubmit={handleHeroBookClick} className="space-y-3.5">
                  {/* Scrap Type Chips */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                      Select Scrap Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {scrapCategoriesList.map((cat) => (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setSelectedScrapType(cat.label)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            selectedScrapType === cat.label
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address / Locality & Weight Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                        Pickup Locality / Pincode
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <input
                          type="text"
                          value={addressPincode}
                          onChange={(e) => setAddressPincode(e.target.value)}
                          placeholder="e.g. 462001 or Arera Colony"
                          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                        Estimated Weight
                      </label>
                      <select
                        value={weightEstimate}
                        onChange={(e) => setWeightEstimate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      >
                        <option value="0 - 15 kg">Light (0 - 15 kg)</option>
                        <option value="15 - 50 kg">Medium (15 - 50 kg) • Most Common</option>
                        <option value="50 - 200 kg">Large (50 - 200 kg)</option>
                        <option value="Commercial 200+ kg">Commercial / Society (200+ kg)</option>
                      </select>
                    </div>
                  </div>

                  {/* Book Pickup Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <span>Check Rates & Book Free Pickup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Trust mini-pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ISO Digital Scales</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Instant UPI / Cash</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Executive</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Recycled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Electric Rickshaw Clean Fleet Showcase */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Zero-Emission EV Collection Fleet
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Interactive 3D
                  </span>
                </div>

                {/* 3D Canvas */}
                <ElectricRickshawScene />

                {/* EV Quick Specs */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Payload</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 font-mono">500 KG</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block uppercase font-bold">Range</span>
                    <span className="font-extrabold text-xs sm:text-sm text-emerald-700 font-mono">110 KM/chg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Carbon</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 font-mono">0.0 G</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST NUMBERS / IMPACT METRICS RIBBON (THE KABADIWALA BENCHMARKS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">500k+</span>
            <p className="text-xs font-semibold text-slate-600">Happy Households Served</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Recycle className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">10,000+</span>
            <p className="text-xs font-semibold text-slate-600">Tonnes Waste Diverted</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">₹12 Cr+</span>
            <p className="text-xs font-semibold text-slate-600">Paid Directly to Citizens</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">100%</span>
            <p className="text-xs font-semibold text-slate-600">ISO Digital Weighing Guarantee</p>
          </div>
        </div>
      </section>

      {/* 3. LIVE SCRAP RATES CATALOG (THE KABADIWALA SIGNATURE PRICE BOARD) */}
      <section id="scrap-rates-section" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-1.5 border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>TRANSPARENT REFINERY BENCHMARK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Today's Scrap Rates in {selectedCity}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Refinery-grade fair pricing updated hourly. Zero under-weighing, zero arbitrary price cuts.
            </p>
          </div>

          {/* Search bar inside rate board */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs focus-within:border-emerald-500 w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchItemQuery}
                onChange={(e) => setSearchItemQuery(e.target.value)}
                placeholder="Search scrap item (e.g. copper, newspaper)..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              onClick={onOpenCalculator}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all shrink-0 flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Paper', 'Plastics', 'Metals', 'EWaste', 'Glass'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'EWaste' ? 'E-Waste & Electronics' : cat}
            </button>
          ))}
        </div>

        {/* Dynamic Scrap Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredScrapItems.map((item) => {
            const isPositive = item.change24h >= 0;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isPositive ? `+${item.change24h}%` : `${item.change24h}%`}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-700 font-mono">
                      ₹{item.price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/{item.unit}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showToast(`Book pickup for ${item.name} at ₹${item.price}/${item.unit}`);
                        setIsLoginModalOpen(true);
                      } else {
                        onNavigateToDashboard('citizen');
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-0.5"
                  >
                    <span>Sell</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS (THE KABADIWALA 4-STEP PROCESS) */}
      <section id="how-it-works-section" className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            SIMPLE 4-STEP WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How The Kabadiwala Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Sell your dry recyclables from the comfort of your couch in four effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group hover:border-emerald-200 transition-all">
            <span className="text-3xl font-black text-emerald-600/30 absolute top-4 right-4 font-mono">
              01
            </span>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Schedule a Pickup</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose your preferred date, convenient time slot, and estimated scrap volume on the portal.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group hover:border-emerald-200 transition-all">
            <span className="text-3xl font-black text-emerald-600/30 absolute top-4 right-4 font-mono">
              02
            </span>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Truck className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Executive Arrives</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our uniformed, background-verified pickup partner arrives at your gate with electric cargo vehicles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group hover:border-emerald-200 transition-all">
            <span className="text-3xl font-black text-emerald-600/30 absolute top-4 right-4 font-mono">
              03
            </span>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Scale className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Digital Weighing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scrap is weighed on ISO-certified Bluetooth smart scales. Weights sync live to your mobile screen.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group hover:border-emerald-200 transition-all">
            <span className="text-3xl font-black text-emerald-600/30 absolute top-4 right-4 font-mono">
              04
            </span>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Zap className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Instant Digital Payment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm hand-off via secure 4-digit OTP and receive instant funds via UPI, Paytm, IMPS, or Cash.
            </p>
          </div>
        </div>
      </section>

      {/* 5. OUR SERVICES (THE KABADIWALA FULL SERVICE SUITE) */}
      <section id="services-section" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            SUSTAINABILITY SOLUTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comprehensive Waste Management Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Customized circular economy solutions for households, residential societies, corporate offices, and industries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Recycle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Doorstep Scrap Collection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Free on-demand scrap collection for individual homes and apartments. 40+ dry waste categories monetized transparently.
            </p>
          </div>

          {/* Service 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">B2B & Corporate Recycling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              End-to-end dry waste disposal contracts for IT parks, hotels, educational campuses, and industrial warehouses with GST invoicing.
            </p>
          </div>

          {/* Service 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Confidential Paper Shredding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Secure on-site or off-site destruction of classified business files, legal records, and tax filings with official ISO certificates of destruction.
            </p>
          </div>

          {/* Service 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Vehicle Scrappage Policy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Govt-authorized dismantling of end-of-life cars and two-wheelers with official Certificate of Deposit for road tax exemptions.
            </p>
          </div>

          {/* Service 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Zero Waste Societies (RWA)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Community recycling drives, wet waste composting installations, and green certifications for housing societies.
            </p>
          </div>

          {/* Service 6 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">EPR Compliance for Brands</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CPCB-registered recycling credits for plastic packaging (PWM Rules 2022) and e-waste management for consumer electronics brands.
            </p>
          </div>
        </div>
      </section>

      {/* 6. AI SCRAP INTELLIGENCE (INTEGRATED COMPONENT) */}
      <section id="scrap-depots-section">
        <AiScrapIntelligence />
      </section>

      {/* 7. ENVIRONMENTAL IMPACT COUNTER (THE KABADIWALA GREEN AUDIT) */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-700/50 px-3 py-1 rounded-full">
              COLLECTIVE PLANETARY SAVINGS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Our Environmental Footprint Counter
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
              Every kilogram of paper, metal, and plastic you recycle through The Kabadiwala saves valuable resources.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-emerald-700/60">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white">450k+</span>
              <p className="text-xs text-emerald-200 font-medium">Trees Preserved</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-300">38M+</span>
              <p className="text-xs text-emerald-200 font-medium">Litres Water Saved</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white">1.2M+</span>
              <p className="text-xs text-emerald-200 font-medium">kWh Energy Conserved</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-300">12,500</span>
              <p className="text-xs text-emerald-200 font-medium">MT CO₂ Abated</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BECOME A PARTNER / KABADIWALA COLLECTOR SECTION */}
      <section className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>COLLECTOR PARTNER ONBOARDING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Turn Scrap Collection into a Respected, High-Income Enterprise.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Join The Kabadiwala network as a certified collection partner. Enjoy guaranteed daily pickup routes,
              free electric cargo vehicle financing, smart Bluetooth scales, and direct factory payouts bypassing cartel middlemen.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>₹38k - ₹52k Monthly Earnings</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aadhaar Identity Badge</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Middleman Cuts</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-stretch gap-3">
            <button
              onClick={handlePartnerApply}
              className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Join as Collector Partner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Requires valid Aadhaar & Smartphone. Multi-lingual voice assistance included.
            </p>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS & REPUTATION */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            TESTIMONIALS
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Loved by 500,000+ Indian Homes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Earlier I had to wait for informal hawkers who would fiddle with their spring scales. The Kabadiwala executive came with a digital scale, weighed everything transparently, and transferred ₹1,850 to my UPI within 2 minutes!"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                alt="Pooja Sharma"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <strong className="block text-xs font-bold text-slate-800">Pooja Sharma</strong>
                <span className="text-[10px] text-slate-500">Arera Colony, Bhopal</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "We organized a society dry scrap drive in Sector 4. The electric rickshaw arrived on time, picked up 420 kg of cardboard and old books, and issued an official recycling certificate for our RWA."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Rajesh Mehra"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <strong className="block text-xs font-bold text-slate-800">Rajesh Mehra</strong>
                <span className="text-[10px] text-slate-500">RWA Secretary, Delhi NCR</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Disposed of 3 old air conditioners and an inverter. Got refinery spot rates of ₹5,400 with doorstep collection. Absolutely professional and hassle-free."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                alt="Amitabh Verma"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <strong className="block text-xs font-bold text-slate-800">Amitabh Verma</strong>
                <span className="text-[10px] text-slate-500">Indore, MP</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
