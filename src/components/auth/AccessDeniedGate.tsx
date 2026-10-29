import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export const AccessDeniedGate: React.FC<{
  requiredRole: UserRole;
  onOpenRegister: (role: UserRole) => void;
  onOpenLogin: () => void;
}> = ({ requiredRole, onOpenRegister, onOpenLogin }) => {
  const { currentUser, loginByRole } = useApp();

  const roleTitles: Record<UserRole, string> = {
    citizen: 'Citizen / Household Scrap Portal',
    kabadiwala: 'Verified Kabadiwala Partner Terminal',
    admin: 'Central Operations & Admin Governance',
  };

  return (
    <div className="py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Access Restricted
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Partner Access Gate
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            This dashboard is restricted strictly to authorized{' '}
            <strong className="text-slate-900 uppercase font-bold">{roleTitles[requiredRole]}</strong> holders.
          </p>
        </div>

        {currentUser && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Active Session:</span>
            <p className="font-bold text-slate-800">{currentUser.name}</p>
            <p className="text-slate-600 font-mono">
              Role: <span className="text-emerald-700 font-bold uppercase">{currentUser.role}</span>
            </p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={() => onOpenRegister(requiredRole)}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Register as {requiredRole.toUpperCase()} Partner</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
          >
            Switch to Authorized Partner Account
          </button>

          {currentUser && (
            <button
              onClick={() => loginByRole(currentUser.role)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Return to My {currentUser.role.toUpperCase()} Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
