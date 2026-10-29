import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRESET_USERS } from '../../data/mockData';
import { UserRole, AuthUser } from '../../types';
import { signInWithGoogle } from '../../lib/firebase';
import {
  ShieldCheck,
  User,
  Truck,
  X,
  CheckCircle2,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginModal: React.FC<{
  onLoginSuccess?: (role: UserRole) => void;
}> = ({ onLoginSuccess }) => {
  const { isLoginModalOpen, setIsLoginModalOpen, currentUser, loginAsUser, showToast } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [phoneNumber, setPhoneNumber] = useState('+91 98711 54321');
  const [partnerId, setPartnerId] = useState('COL-8492');
  const [adminPin, setAdminPin] = useState('PUN-2026');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = PRESET_USERS.find((u) => u.role === selectedRole);
    if (preset) {
      loginAsUser(preset);
      setIsLoginModalOpen(false);
      if (onLoginSuccess) onLoginSuccess(selectedRole);
    }
  };

  const handleQuickLogin = (user: AuthUser) => {
    loginAsUser(user);
    setIsLoginModalOpen(false);
    if (onLoginSuccess) onLoginSuccess(user.role);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        const newUser: AuthUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google User',
          email: fbUser.email || undefined,
          role: selectedRole,
          phone: fbUser.phoneNumber || '+91 98700 12345',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        };
        loginAsUser(newUser);
        setIsLoginModalOpen(false);
        if (onLoginSuccess) onLoginSuccess(selectedRole);
        showToast(`Signed in with Google as ${newUser.name} (${selectedRole.toUpperCase()})`);
      }
    } catch (err) {
      console.warn('Google sign-in error:', err);
      // Fallback gracefully for preview iframe environment
      const preset = PRESET_USERS.find((u) => u.role === selectedRole) || PRESET_USERS[0];
      loginAsUser(preset);
      setIsLoginModalOpen(false);
      if (onLoginSuccess) onLoginSuccess(selectedRole);
      showToast(`Authenticated as ${preset.name} (${selectedRole.toUpperCase()})`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-xl tracking-tight">
              Sign In to The Kabadiwala
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your role to access your dedicated secure workspace
            </p>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs (TheKabadiwala Style) */}
        <div className="my-5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Your Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'citizen' as UserRole, label: 'Citizen', icon: <User className="w-4 h-4" />, sub: 'Sell Scrap' },
              { id: 'kabadiwala' as UserRole, label: 'Collector', icon: <Truck className="w-4 h-4" />, sub: 'Drive & Earn' },
              { id: 'admin' as UserRole, label: 'Admin', icon: <ShieldCheck className="w-4 h-4" />, sub: 'Operations' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedRole === tab.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={selectedRole === tab.id ? 'text-white' : 'text-slate-500'}>
                    {tab.icon}
                  </span>
                  <span className="font-bold text-xs">{tab.label}</span>
                </div>
                <p className={`text-[10px] ${selectedRole === tab.id ? 'text-emerald-100 font-medium' : 'text-slate-500'}`}>
                  {tab.sub}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Role-Specific Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          {selectedRole === 'citizen' && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Citizen Household Seller
              </span>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Registered Phone / OTP:</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'kabadiwala' && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Collector Partner Driver ID
              </span>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Partner Identifier:</label>
                <input
                  type="text"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Central Operations Clearance
              </span>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Officer Security PIN:</label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Continue to {selectedRole.toUpperCase()} Dashboard</span>
          </button>
        </form>

        {/* Google Sign In option */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.98 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        </div>

        {/* 1-Click Fast Switcher for Instant Demo Review */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Review (Fast Role Access):</span>
          </p>
          <div className="space-y-1.5">
            {PRESET_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickLogin(user)}
                className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/90 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-emerald-200" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-700 transition-colors">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {user.role} • {user.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
