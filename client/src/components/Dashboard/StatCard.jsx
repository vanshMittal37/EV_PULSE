import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, change, isIncrease, data, priority, bgGradient, Icon }) => {
  return (
    <div className={`p-6 rounded-[2rem] border border-white/20 shadow-xl transition-all duration-300 group relative overflow-hidden ${bgGradient || 'bg-white'}`}>
      {/* Decorative glass effect overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {Icon && <Icon className={`w-4 h-4 ${priority ? 'text-red-600 animate-bounce' : 'text-gray-500'}`} />}
              <p className={`text-sm font-black uppercase tracking-tighter ${priority ? 'text-red-700' : 'text-gray-500'}`}>
                {title}
              </p>
            </div>
            <h3 className={`text-3xl font-black tabular-nums tracking-tighter ${priority ? 'text-red-900' : 'text-gray-900'}`}>
              {value}
            </h3>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke={priority ? "#ef4444" : isIncrease ? "#10b981" : "#ef4444"} 
                  strokeWidth={3} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
            priority 
              ? "bg-red-500 text-white shadow-lg shadow-red-500/40" 
              : isIncrease 
                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" 
                : "bg-red-500/10 text-red-700 border border-red-500/20"
          }`}>
            {!priority && (isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
            <span className="uppercase">{change}</span>
          </div>
          <div className="text-[10px] font-black text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-widest">
            vs last month
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
