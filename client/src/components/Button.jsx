import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0f19] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white focus:ring-brand-500 shadow-lg shadow-brand-500/10 active:scale-95',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-600 active:scale-95',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-lg shadow-rose-500/10 active:scale-95',
    outline: 'border border-slate-700 hover:bg-slate-900/50 text-slate-300 focus:ring-slate-700 active:scale-95',
    glass: 'glass-panel hover:bg-white/5 border-white/5 hover:border-brand-500/30 text-slate-200 focus:ring-brand-500 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
