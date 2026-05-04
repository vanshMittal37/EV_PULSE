import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, ExternalLink, Eye, Archive, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityTable = ({ data }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-x-auto" ref={menuRef}>
      <div className="p-8 flex justify-between items-center border-b border-gray-50">
        <div>
          <h4 className="text-gray-900 font-bold text-xl tracking-tight mb-1">Recent System Activity</h4>
          <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Real-time Logs</p>
        </div>
        <button className="text-[11px] font-black text-[#10b981] uppercase tracking-widest hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all border border-[#10b981]/10 flex items-center gap-2">
          View Full Log <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="relative overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest first:rounded-tl-2xl">Time</th>
              <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest">Action</th>
              <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest">User / Entity</th>
              <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest text-right last:rounded-tr-2xl">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, index) => {
              const isLastTwo = index >= data.length - 2 && data.length > 3;
              return (
                <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-6 text-base font-bold text-gray-500 tabular-nums">{row.time}</td>
                  <td className="px-8 py-6 text-base font-black text-gray-900">{row.action}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 uppercase">
                        {row.user.charAt(0)}
                      </div>
                      <span className="text-base font-black text-gray-700">{row.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tighter ${
                      row.status === 'Success' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button 
                      onClick={() => toggleMenu(index)}
                      className={`p-2.5 rounded-xl transition-all border shadow-sm ${
                        activeMenu === index 
                          ? 'bg-[#10b981] text-white border-[#10b981] shadow-lg shadow-emerald-500/30' 
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-white hover:border-[#10b981] hover:text-[#10b981] hover:shadow-md'
                      }`}
                    >
                      {activeMenu === index ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-6 h-6" />}
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === index && (
                        <motion.div
                          initial={{ opacity: 0, y: isLastTwo ? -10 : 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: isLastTwo ? -10 : 10, scale: 0.95 }}
                          className={`absolute right-8 ${isLastTwo ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] p-2 overflow-hidden`}
                        >
                          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors rounded-xl group/item">
                            <Eye className="w-4 h-4 text-gray-400 group-hover/item:text-[#10b981]" />
                            View Details
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors rounded-xl group/item">
                            <Archive className="w-4 h-4 text-gray-400 group-hover/item:text-red-500" />
                            Archive Log
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
