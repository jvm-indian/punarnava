import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AuthUser } from '../../types';
import { signInWithGoogle, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  X,
  User,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const RegisterPortalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}> = ({ isOpen, onClose, defaultRole = 'citizen' }) => {
  const { loginAsUser, showToast } = useApp();

  const [role, setRole] = useState<UserRole>(defaultRole);

  // Citizen form
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenAddress, setCitizenAddress] = useState('');
  const [citizenUpi, setCitizenUpi] = useState('');

  // Kabadiwala form
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Electric Cargo E-Rickshaw');
  const [vehiclePlate, setVehiclePlate] = useState('DL-01-EV-8821');
  const [aadhaarNumber, setAadhaarNumber] = useState('XXXX-XXXX-4912');
  const [hub, setHub] = useState('Indiranagar Cluster Hub #4');

  // Admin form
  const [adminKey, setAdminKey] = useState('');

  if (!isOpen) return null;

  const handleRegisterCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: AuthUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: citizenName.trim() || 'New Citizen Seller',
      role: 'citizen',
      phone: citizenPhone.trim() || '+91 98700 12345',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    };

    try {
      await setDoc(doc(db, 'users', newUser.id), {
        ...newUser,
        address: citizenAddress,
        upiId: citizenUpi,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    loginAsUser(newUser);
    showToast(`🎉 Welcome ${newUser.name}! Your Citizen Scrap Portal is active.`);
    onClose();
  };

  const handleRegisterKabadiwala = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCollector: AuthUser = {
      id: `COL-${Math.floor(8000 + Math.random() * 1000)}`,
      name: driverName.trim() || 'Verified Partner Driver',
      role: 'kabadiwala',
      phone: driverPhone.trim() || '+91 98451 00000',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      vehicleType,
      vehiclePlate,
      badgeTier: 'Gold Partner',
      hubLocation: hub,
      isOnline: true,
    };

    try {
      await setDoc(doc(db, 'users', newCollector.id), {
        ...newCollector,
        aadhaarMasked: aadhaarNumber,
        kycStatus: 'verified',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    loginAsUser(newCollector);
    showToast(`🛺 Verified Partner Badge Issued! Welcome ${newCollector.name} to the Driver Portal.`);
    onClose();
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === 'PUNARNAVA2026' || adminKey === 'admin' || adminKey === 'PUN-2026') {
      const adminUser: AuthUser = {
        id: 'adm-01',
        name: 'Siddharth Verma',
        role: 'admin',
        phone: '+91 98200 44102',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        badgeTier: 'Central Governance',
        hubLocation: 'Central Operations Control',
      };
      loginAsUser(adminUser);
      showToast('🛡️ Admin Clearance Granted. Central Operations & Price Setter active.');
      onClose();
    } else {
      showToast('⚠️ Invalid Security Passcode! Use PUNARNAVA2026 for admin clearance.');
    }
  };

  const handleGoogleSignInForRole = async () => {
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser) {
        const newUser: AuthUser = {
          id: googleUser.uid,
          name: googleUser.displayName || 'Authorized User',
          email: googleUser.email || undefined,
          phone: googleUser.phoneNumber || '+91 98765 43210',
          avatar: googleUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          role,
          badgeTier: role === 'kabadiwala' ? 'Verified Driver' : role === 'admin' ? 'Admin' : undefined,
        };

        try {
          await setDoc(doc(db, 'users', googleUser.uid), {
            ...newUser,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Firestore user save:', err);
        }

        loginAsUser(newUser);
        showToast(`Google Sign-In Verified! Connected as ${newUser.name} [${role.toUpperCase()}]`);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
              Create Your Portal Account
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your role to sign up and open your dedicated dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="my-4">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Choose Account Role:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'citizen', label: 'Household', icon: <User className="w-4 h-4" />, desc: 'Sell Scrap' },
              { id: 'kabadiwala', label: 'Driver Partner', icon: <Truck className="w-4 h-4" />, desc: 'Earn & Collect' },
              { id: 'admin', label: 'Admin Ops', icon: <ShieldCheck className="w-4 h-4" />, desc: 'Governance' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRole(tab.id as UserRole)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  role === tab.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={role === tab.id ? 'text-white' : 'text-slate-500'}>
                    {tab.icon}
                  </span>
                  <span className="font-bold text-xs">{tab.label}</span>
                </div>
                <p className={`text-[10px] ${role === tab.id ? 'text-emerald-100 font-medium' : 'text-slate-500'}`}>
                  {tab.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Role-Specific Sign Up Form */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4">
          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignInForRole}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.18 3.645-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.92H1.28v3.13C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.33 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.28C.46 8.22 0 10.05 0 12s.46 3.78 1.28 5.41l4.05-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.28 6.59l4.05 3.13c.94-2.82 3.57-4.97 6.67-4.97z"
              />
            </svg>
            <span>Continue with Google ({role.toUpperCase()})</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Or register with details</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Citizen Form */}
          {role === 'citizen' && (
            <form onSubmit={handleRegisterCitizen} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile (for OTP)</label>
                  <input
                    type="tel"
                    placeholder="+91 98700 12345"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (for payouts)</label>
                  <input
                    type="text"
                    placeholder="name@okaxis"
                    value={citizenUpi}
                    onChange={(e) => setCitizenUpi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doorstep Address</label>
                <input
                  type="text"
                  placeholder="Flat / House No, Apartment, Sector, City"
                  value={citizenAddress}
                  onChange={(e) => setCitizenAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Household Account & Enter Portal</span>
              </button>
            </form>
          )}

          {/* Kabadiwala Form */}
          {role === 'kabadiwala' && (
            <form onSubmit={handleRegisterKabadiwala} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collector Partner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rameshwar Kumar"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile (Dispatch)</label>
                  <input
                    type="tel"
                    placeholder="+91 98451 00000"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Plate No.</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-emerald-700 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Electric Cargo E-Rickshaw">Electric Cargo E-Rickshaw</option>
                    <option value="Electric Cargo Tricycle">Electric Cargo Tricycle</option>
                    <option value="Tata Ace EV Mini-Truck">Tata Ace EV Mini-Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Aggregation Hub</label>
                  <input
                    type="text"
                    value={hub}
                    onChange={(e) => setHub(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
              >
                <Truck className="w-4 h-4" />
                <span>Onboard as Driver & Open Terminal</span>
              </button>
            </form>
          )}

          {/* Admin Form */}
          {role === 'admin' && (
            <form onSubmit={handleRegisterAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Central Operations Security Key
                </label>
                <input
                  type="password"
                  placeholder="Enter officer security key (PUNARNAVA2026)"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-emerald-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Notice: Central governance clearance requires institutional credentials. For testing this applet, use key: <code className="text-emerald-700 font-mono font-bold">PUNARNAVA2026</code>
              </p>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Clearance & Enter Admin Console</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
