import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UtilizationChart = ({ data }) => {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-[500px] flex flex-col group transition-all duration-300 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h4 className="text-gray-900 font-bold text-2xl tracking-tight mb-1">Station Utilization Trend</h4>
          <p className="text-base text-gray-500 font-bold tracking-wide uppercase">Last 30 Days Growth</p>
        </div>
        <select className="bg-gray-50 border border-gray-200 text-sm font-black text-gray-900 rounded-2xl px-6 py-3 focus:outline-none focus:ring-4 focus:ring-[#10b981]/10 focus:border-[#10b981] transition-all cursor-pointer shadow-sm hover:bg-white">
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>Year to Date</option>
        </select>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 30 }}>
            <defs>
              <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 14, fontWeight: 900, fill: '#475569' }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 14, fontWeight: 900, fill: '#475569' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                color: '#fff'
              }}
              itemStyle={{ color: '#10b981', fontWeight: 800 }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="utilization" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUtil)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UtilizationChart;
