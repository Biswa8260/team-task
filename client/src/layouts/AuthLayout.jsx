import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage />;
  }

  // Redirect to dashboard if logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Title Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-500/25 mb-3 border border-brand-500/30">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Team Task Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">Collab, assign, and track in real-time</p>
        </div>

        {/* Content Outlet */}
        <div className="glass-panel rounded-2xl shadow-xl border border-white/10 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
