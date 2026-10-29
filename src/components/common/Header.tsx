import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, SupportedLanguage } from '../../types';
import {
  Recycle,
  Scale,
  Globe,
  LogOut,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Building2,
  FileCheck2,
  Sparkles,
  User as UserIcon,
  Truck,
  Shield,
  HelpCircle,
  Wallet,
  Zap,
} from 'lucide-react';

export const Header: React.FC<{
  currentView: 'home' | 'portal';
  onNavigateHome: () => void;
  onNavigatePortal: (targetRole: UserRole) => void;
  onOpenRegisterModal: (role?: UserRole) => void;
  onOpenScale: () => void;
  onOpenCalculator: () => void;
  onScrollToRates?: () => void;
  onScrollToDepots?: () => void;
  onScrollToServices?: () => void;
  onScrollToHowItWorks?: () => void;
}> = ({
  currentView,
  onNavigateHome,
  onNavigatePortal,
  onOpenRegisterModal,
  onOpenScale,
  onOpenCalculator,
  onScrollToRates,
  onScrollToDepots,
  onScrollToServices,
  onScrollToHowItWorks,
}) => {
  const {
    currentUser,
    isAuthenticated,
    setIsLoginModalOpen,
    logout,
    language,
    setLanguage,
    scaleState,
    selectedCity,
    setSelectedCity,
    walletBalance,
    setIsWithdrawModalOpen,
  } = useApp();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const availableCities = [
    'Delhi NCR',
    'Bhopal',
    'Indore',
    'Bengaluru',
    'Mumbai',
    'Pune',
    'Lucknow',
    'Hyderabad',
    'Jaipur',
    'Ahmedabad',
  ];

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'citizen':
        return 'Citizen Account';
      case 'kabadiwala':
        return 'Partner Collector';
      case 'admin':
        return 'Operations Admin';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'citizen':
        return <UserIcon className="w-3.5 h-3.5 text-emerald-600" />;
      case 'kabadiwala':
        return <Truck className="w-3.5 h-3.5 text-teal-600" />;
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs transition-all">
      {/* Top Banner: TheKabadiwala style trust bar */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] sm:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium text-emerald-100">
              ISO 9001:2015 Certified Digital Weighing • Instant UPI Payouts • Free Doorstep Pickup in {selectedCity}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-emerald-200">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-300" />
              <span>CPCB EPR Registered Partner</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-300">Toll Free: 1800-833-0338</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Left: TheKabadiwala Brand & City Dropdown */}
        <div className="flex items-center gap-6">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Recycle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                  The<span className="text-emerald-600">Kabadiwala</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  PUNARNAVA
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium tracking-tight">
                Doorstep Scrap Recycling • Instant Payout
              </p>
            </div>
          </button>

          {/* City Selector (TheKabadiwala signature feature) */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all hover:border-emerald-300"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 py-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                  Select Operating City
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                        selectedCity === city
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clean Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <button
              onClick={() => {
                onNavigateHome();
                if (onScrollToRates) onScrollToRates();
              }}
              className="hover:text-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Scrap Rates</span>
            </button>

            <button
              onClick={() => {
                onNavigateHome();
                if (onScrollToHowItWorks) onScrollToHowItWorks();
                else {
                  const el = document.getElementById('how-it-works-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-emerald-700 transition-colors"
            >
              How It Works
            </button>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className="hover:text-emerald-700 transition-colors flex items-center gap-1"
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
              </button>
              <div className="absolute left-0 top-full mt-2 w-64 py-2 bg-white rounded-2xl shadow-xl border border-slate-100 hidden group-hover:block z-50 animate-in fade-in duration-150">
                <a
                  href="#services-section"
                  onClick={() => {
                    onNavigateHome();
                    const el = document.getElementById('services-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                >
                  <strong className="block text-slate-900">Doorstep Scrap Pickup</strong>
                  <span className="text-slate-600 text-[11px]">Free collection for homes & societies</span>
                </a>
                <a
                  href="#services-section"
                  onClick={() => {
                    onNavigateHome();
                    const el = document.getElementById('services-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                >
                  <strong className="block text-slate-900">B2B & Office Recycling</strong>
                  <span className="text-slate-600 text-[11px]">Corporate waste audits & EPR reports</span>
                </a>
                <a
                  href="#services-section"
                  onClick={() => {
                    onNavigateHome();
                    const el = document.getElementById('services-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                >
                  <strong className="block text-slate-900">Confidential Paper Shredding</strong>
                  <span className="text-slate-600 text-[11px]">Secured on-site document destruction</span>
                </a>
                <a
                  href="#services-section"
                  onClick={() => {
                    onNavigateHome();
                    const el = document.getElementById('services-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                >
                  <strong className="block text-slate-900">Vehicle Scrappage Policy</strong>
                  <span className="text-slate-600 text-[11px]">Government authorized certificate of deposit</span>
                </a>
              </div>
            </div>

            <button
              onClick={onOpenCalculator}
              className="hover:text-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Calculate Price</span>
            </button>

            <button
              onClick={() => {
                onNavigateHome();
                if (onScrollToDepots) onScrollToDepots();
              }}
              className="hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              <span>Depots & AI</span>
            </button>
          </nav>
        </div>

        {/* Right Actions: Scale Status, Language, Book Pickup & Auth */}
        <div className="flex items-center gap-3">
          {/* Smart Scale Indicator (if connected) */}
          {scaleState.isConnected && (
            <button
              onClick={onOpenScale}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 hover:bg-emerald-100 transition-all font-mono"
              title="Bluetooth Smart Scale Live Reading"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold">{scaleState.currentWeight.toFixed(2)} kg</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors">
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-600" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-44 py-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl hidden group-hover:block z-50 animate-in fade-in duration-150">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${
                    language === l.code
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{l.label}</span>
                  {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* AUTHENTICATION STATE */}
          {!isAuthenticated || !currentUser ? (
            /* Unauthenticated Visitor: "Book a Pickup" (Green CTA) + "Login" */
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                Log In
              </button>

              <button
                onClick={() => {
                  // Book a pickup prompts user into the portal / login
                  setIsLoginModalOpen(true);
                }}
                className="px-4 sm:px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Pickup</span>
              </button>
            </div>
          ) : (
            /* Authenticated User: Profile badge, Dashboard Switcher & Logout */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Home vs Dashboard Toggle */}
              <button
                onClick={() => {
                  if (currentView === 'home' && currentUser) {
                    onNavigatePortal(currentUser.role);
                  } else {
                    onNavigateHome();
                  }
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                {currentView === 'home' ? (
                  <>
                    <span>Go to Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Website Home</span>
                  </>
                )}
              </button>

              {/* Citizen Digital Wallet Pill */}
              {currentUser.role === 'citizen' && (
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 transition-all cursor-pointer shadow-xs hover:scale-105"
                  title="Digital Scrap Wallet - Click to Withdraw to UPI"
                >
                  <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </button>
              )}

              {/* User Identity Pill */}
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-200"
                />
                <div className="hidden sm:block text-left">
                  <span className="font-bold text-slate-800 block leading-tight text-[11px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    {getRoleIcon(currentUser.role)}
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                title="Log out of session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
