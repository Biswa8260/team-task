import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
      <div className="text-left">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <User className="text-brand-500" />
          My Profile Account
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your account specifications and authorization settings.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        {/* Banner Glow */}
        <div className="h-28 bg-gradient-to-r from-brand-600 to-indigo-600 relative flex items-end p-6 border-b border-white/5">
          <div className="h-16 w-16 rounded-2xl bg-[#0b0f19] ring-4 ring-[#0b0f19] flex items-center justify-center font-bold text-2xl text-brand-400 border border-slate-700 translate-y-6">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Stats/Details */}
        <div className="pt-10 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{user.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Account Member ID: {user._id}</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <Mail className="text-slate-500" size={18} />
              <div>
                <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</h5>
                <p className="text-xs font-semibold text-slate-200">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <Shield className="text-slate-500" size={18} />
              <div>
                <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">System Role</h5>
                <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  user.role === 'Admin' 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
