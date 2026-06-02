import React from 'react';

const Spinner = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const loader = (
    <div className={`animate-spin rounded-full border-t-brand-500 border-r-brand-500/10 border-b-brand-500/10 border-l-brand-500/10 ${sizeClasses[size]}`} />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-3">
          {loader}
          <span className="text-sm font-medium text-slate-400 tracking-wider">Loading Team Task Manager...</span>
        </div>
      </div>
    );
  }

  return loader;
};

export default Spinner;
