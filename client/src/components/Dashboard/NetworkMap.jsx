import React from 'react';
import { Globe, MapPin } from 'lucide-react';

const NetworkMap = () => {
  // Static dots representing locations
  const dots = [
    { top: '30%', left: '20%', label: 'San Francisco' },
    { top: '45%', left: '75%', label: 'New Delhi' },
    { top: '35%', left: '48%', label: 'London' },
    { top: '65%', left: '82%', label: 'Sydney' },
    { top: '40%', left: '15%', label: 'Los Angeles' },
    { top: '55%', left: '78%', label: 'Tokyo' },
    { top: '42%', left: '52%', label: 'Berlin' },
    { top: '25%', left: '25%', label: 'New York' },
  ];

  return (
    <div className="bg-[#0f172a] rounded-[2rem] p-8 h-[500px] relative overflow-hidden group shadow-2xl border border-white/5">
      <div className="flex justify-between items-center relative z-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10b981]/20 rounded-lg">
            <Globe className="text-[#10b981] w-5 h-5" />
          </div>
          <h4 className="text-white font-bold text-lg tracking-tight">Global Network Map</h4>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <span className="w-2 h-2 bg-[#10b981] rounded-full animate-ping"></span>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live: 7,203 active</span>
        </div>
      </div>

      {/* Map Background Placeholder */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      {/* Decorative World Map Outline (SVG) */}
      <div className="absolute inset-0 flex items-center justify-center p-12 opacity-10">
         <Globe className="w-full h-full text-white" strokeWidth={0.5} />
      </div>

      {/* Glowing Neon Dots */}
      {dots.map((dot, i) => (
        <div 
          key={i}
          className="absolute group/dot cursor-pointer"
          style={{ top: dot.top, left: dot.left }}
        >
          <div className="relative">
            <div className="w-3 h-3 bg-[#10b981] rounded-full shadow-[0_0_15px_#10b981] animate-pulse"></div>
            <div className="absolute -inset-2 bg-[#10b981]/20 rounded-full animate-ping"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white text-gray-900 px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-all duration-300 translate-y-2 group-hover/dot:translate-y-0 shadow-xl border border-gray-100">
               <div className="flex items-center gap-1.5">
                 <MapPin className="w-3 h-3 text-[#10b981]" />
                 {dot.label}
               </div>
               <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white"></div>
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-8 left-8 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Stations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Planned</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
