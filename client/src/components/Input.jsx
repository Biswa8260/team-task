import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  name,
  placeholder,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={`glass-input px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
          error ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
        }`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-400 mt-0.5 font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
