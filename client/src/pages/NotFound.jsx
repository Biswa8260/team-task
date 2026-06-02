import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-5 animate-fadeIn">
      <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/15 animate-bounce">
        <AlertCircle size={48} />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-300">Page Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          The link you followed may be broken or the page may have been removed. Let's return you to workspace security.
        </p>
      </div>

      <Link to="/dashboard" className="pt-2">
        <Button variant="primary" className="flex items-center gap-1.5">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
