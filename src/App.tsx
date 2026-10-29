import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { LivePriceTicker } from './components/common/LivePriceTicker';
import { HomePage } from './components/home/HomePage';
import { BluetoothScaleWidget } from './components/common/BluetoothScaleWidget';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { PriceCalculatorModal } from './components/citizen/PriceCalculatorModal';
import { SchedulePickupModal } from './components/citizen/SchedulePickupModal';
import { KabadiwalaDashboard } from './components/kabadiwala/KabadiwalaDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterPortalModal } from './components/auth/RegisterPortalModal';
import { AccessDeniedGate } from './components/auth/AccessDeniedGate';
import { UserRole } from './types';
import { Recycle, ArrowRight, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, role, isAuthenticated, toastMessage, setIsLoginModalOpen } = useApp();

  // Navigation: Home or specific Partner Portal
  const [currentView, setCurrentView] = useState<'home' | 'portal'>('home');
  const [targetPortal, setTargetPortal] = useState<UserRole>('citizen');

  // Modals
  const [isScaleOpen, setIsScaleOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultRole, setRegisterDefaultRole] = useState<UserRole>('citizen');
  const [calculatorSelectedItems, setCalculatorSelectedItems] = useState<{ itemId: string; weight: number }[]>([]);

  const handleNavigateHome = () => {
    setCurrentView('home');
  };

  const handleNavigatePortal = (portalRole: UserRole) => {
    if (!isAuthenticated) {
      setRegisterDefaultRole(portalRole);
      setIsLoginModalOpen(true);
      return;
    }
    setTargetPortal(portalRole);
    setCurrentView('portal');
  };

  const handleOpenRegister = (regRole?: UserRole) => {
    if (regRole) setRegisterDefaultRole(regRole);
    setIsRegisterOpen(true);
  };

  const handleProceedFromCalculator = (items: { itemId: string; weight: number }[]) => {
    setCalculatorSelectedItems(items);
    setIsScheduleOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if current user is authorized for the target portal
  const hasAccess = isAuthenticated && currentUser?.role === targetPortal;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl backdrop-blur-md flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <p className="text-xs text-slate-100 font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Main TheKabadiwala Header */}
      <Header
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNavigatePortal={handleNavigatePortal}
        onOpenRegisterModal={handleOpenRegister}
        onOpenScale={() => setIsScaleOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onScrollToRates={() => scrollToSection('scrap-rates-section')}
        onScrollToDepots={() => scrollToSection('scrap-depots-section')}
      />

      {/* Live Market Price Ticker */}
      <LivePriceTicker onOpenCalculator={() => setIsCalculatorOpen(true)} />

      {/* Main Workspace: Public Home or Authenticated Partner Portal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentView === 'home' || !isAuthenticated ? (
          <HomePage
            onOpenRegister={handleOpenRegister}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onNavigateToDashboard={(pRole) => {
              if (!isAuthenticated) {
                setRegisterDefaultRole(pRole);
                setIsLoginModalOpen(true);
              } else {
                setTargetPortal(pRole);
                setCurrentView('portal');
              }
            }}
          />
        ) : (
          /* Role Protected Dashboard Gate */
          !hasAccess ? (
            <AccessDeniedGate
              requiredRole={targetPortal}
              onOpenRegister={handleOpenRegister}
              onOpenLogin={() => setIsLoginModalOpen(true)}
            />
          ) : (
            <>
              {targetPortal === 'citizen' && (
                <CitizenDashboard
                  onOpenSchedule={() => setIsScheduleOpen(true)}
                  onOpenCalculator={() => setIsCalculatorOpen(true)}
                />
              )}

              {targetPortal === 'kabadiwala' && (
                <KabadiwalaDashboard
                  onOpenScaleWidget={() => setIsScaleOpen(true)}
                />
              )}

              {targetPortal === 'admin' && (
                <AdminDashboard />
              )}
            </>
          )
        )}
      </main>

      {/* Shared Modals */}
      <RegisterPortalModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultRole={registerDefaultRole}
      />

      <LoginModal
        onLoginSuccess={(loggedInRole) => {
          setTargetPortal(loggedInRole);
          setCurrentView('portal');
        }}
      />

      <BluetoothScaleWidget
        isOpen={isScaleOpen}
        onClose={() => setIsScaleOpen(false)}
      />

      <PriceCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onProceedToBooking={handleProceedFromCalculator}
      />

      <SchedulePickupModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        initialItems={calculatorSelectedItems}
      />

      {/* The Kabadiwala Professional Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Recycle className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-slate-900 text-lg">
                  The<span className="text-emerald-600">Kabadiwala</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                India's foremost digital doorstep scrap collection & resource recovery network. Transforming informal waste supply chains into transparent, digital circular ecosystems.
              </p>
              <div className="pt-1 text-[11px] text-slate-600 font-medium">
                ISO 9001:2015 Certified • CPCB EPR Registered
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>
                  <button onClick={() => { handleNavigateHome(); scrollToSection('scrap-rates-section'); }} className="hover:text-emerald-700 transition-colors">
                    Today's Scrap Rates
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsCalculatorOpen(true)} className="hover:text-emerald-700 transition-colors">
                    Rate Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => { handleNavigateHome(); scrollToSection('how-it-works-section'); }} className="hover:text-emerald-700 transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => { handleNavigateHome(); scrollToSection('scrap-depots-section'); }} className="hover:text-emerald-700 transition-colors">
                    AI Depots & Hubs
                  </button>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Services</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>Doorstep Scrap Pickup</li>
                <li>B2B Waste Management</li>
                <li>Confidential Paper Shredding</li>
                <li>Vehicle Scrappage Policy</li>
                <li>Zero Waste Society Program</li>
                <li>EPR Credit Token Generation</li>
              </ul>
            </div>

            {/* Operating Cities & Contact */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Operating Network</h4>
              <p className="text-xs text-slate-500">
                Delhi NCR • Bhopal • Indore • Bengaluru • Mumbai • Pune • Lucknow • Jaipur • Hyderabad • Ahmedabad
              </p>
              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                <p className="font-semibold text-slate-800">Helpline: 1800-833-0338</p>
                <p className="text-slate-500">support@thekabadiwala.com</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              © 2026 The Kabadiwala • PUNARNAVA Ecosystem. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              {!isAuthenticated || !currentUser ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors flex items-center gap-1"
                >
                  <span>Partner & Staff Portal Log In</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => handleNavigatePortal(currentUser.role)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors flex items-center gap-1"
                >
                  <span>Open {currentUser.role.toUpperCase()} Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
