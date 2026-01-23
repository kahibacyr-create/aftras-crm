
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, trend, icon, color = 'indigo', onClick }) => {
  const themeMap: Record<string, { bg: string, text: string, title: string, border: string, hover: string, shadow: string, iconBg: string }> = {
    indigo: { 
      bg: 'bg-indigo-50/50', 
      text: 'text-indigo-600', 
      title: 'text-indigo-700', 
      border: 'border-indigo-100', 
      hover: 'hover:border-indigo-300 hover:shadow-indigo-200/50',
      shadow: 'shadow-indigo-100/50',
      iconBg: 'bg-white'
    },
    emerald: { 
      bg: 'bg-emerald-50/50', 
      text: 'text-emerald-600', 
      title: 'text-emerald-700', 
      border: 'border-emerald-100', 
      hover: 'hover:border-emerald-300 hover:shadow-emerald-200/50',
      shadow: 'shadow-emerald-100/50',
      iconBg: 'bg-white'
    },
    amber: { 
      bg: 'bg-amber-50/50', 
      text: 'text-amber-600', 
      title: 'text-amber-700', 
      border: 'border-amber-100', 
      hover: 'hover:border-amber-300 hover:shadow-amber-200/50',
      shadow: 'shadow-amber-100/50',
      iconBg: 'bg-white'
    },
    rose: { 
      bg: 'bg-rose-50/50', 
      text: 'text-rose-600', 
      title: 'text-rose-700', 
      border: 'border-rose-100', 
      hover: 'hover:border-rose-300 hover:shadow-rose-200/50',
      shadow: 'shadow-rose-100/50',
      iconBg: 'bg-white'
    },
    sky: { 
      bg: 'bg-sky-50/50', 
      text: 'text-sky-600', 
      title: 'text-sky-700', 
      border: 'border-sky-100', 
      hover: 'hover:border-sky-300 hover:shadow-sky-200/50',
      shadow: 'shadow-sky-100/50',
      iconBg: 'bg-white'
    }
  };

  const theme = themeMap[color] || themeMap.indigo;

  return (
    <div 
      onClick={onClick}
      className={`
        ${theme.bg} p-6 rounded-[2rem] shadow-sm border-2 transition-all duration-500 group relative overflow-hidden
        ${theme.border} ${theme.shadow} ${theme.hover}
        ${onClick ? 'cursor-pointer hover:-translate-y-2 active:scale-95' : ''}
      `}
    >
      {/* Subtle background glow effect on hover */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${theme.bg.replace('/50', '')}`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 pr-2">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors ${theme.title}`}>
            {label}
          </p>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none group-hover:scale-105 transition-transform origin-left duration-300">
            {value}
          </h3>
          {subValue && (
            <div className="flex items-center mt-4">
              {trend === 'up' && (
                <span className="text-[10px] text-emerald-600 font-black flex items-center bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-emerald-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  {subValue}
                </span>
              )}
              {trend === 'down' && (
                <span className="text-[10px] text-rose-600 font-black flex items-center bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-rose-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                  {subValue}
                </span>
              )}
              {!trend && (
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-gray-100 shadow-sm">
                  {subValue}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-md shrink-0 border border-white/50 ${theme.iconBg} ${theme.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
