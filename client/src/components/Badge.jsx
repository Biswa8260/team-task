import React from 'react';

const Badge = ({ type, value }) => {
  const getStyles = () => {
    switch (value) {
      // Statuses
      case 'Todo':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      
      // Priorities
      case 'Low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Medium':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {value}
    </span>
  );
};

export default Badge;
