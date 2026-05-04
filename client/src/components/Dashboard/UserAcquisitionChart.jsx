import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UserAcquisitionChart = ({ data: chartData = [] }) => {
  const data = chartData.length > 0 ? chartData : [
    { week: 'W1', users: 400 },
    { week: 'W2', users: 300 },
    { week: 'W3', users: 600 },
    { week: 'W4', users: 800 },
    { week: 'W5', users: 500 },
    { week: 'W6', users: 900 },
  ];

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h4 className="text-gray-900 font-bold text-xl tracking-tight mb-1">User Acquisition</h4>
        <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Growth per Week</p>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 14, fontWeight: 900, fill: '#475569' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 14, fontWeight: 900, fill: '#475569' }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff'
              }}
              itemStyle={{ color: '#10b981', fontWeight: 800 }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }}
            />
            <Bar dataKey="users" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#10b981' : '#e2e8f0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserAcquisitionChart;
