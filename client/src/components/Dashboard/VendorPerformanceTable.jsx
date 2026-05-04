import React from 'react';

const VendorPerformanceTable = ({ data = [] }) => {
  const vendors = data.length > 0 ? data : [
    { name: 'ChargePoint India', location: 'Delhi NCR', performance: 98, status: 'Elite' },
    { name: 'Tata Power EZ', location: 'Mumbai', performance: 94, status: 'Elite' },
    { name: 'PowerUp Solutions', location: 'Bengaluru', performance: 88, status: 'Pro' },
    { name: 'GreenDrive Hub', location: 'Hyderabad', performance: 82, status: 'Pro' },
  ];

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h4 className="text-gray-900 font-bold text-2xl tracking-tight mb-1">Top Performing Vendors</h4>
        <p className="text-base text-gray-500 font-black tracking-wide uppercase">Efficiency Ratings</p>
      </div>

      <div className="space-y-8">
        {vendors.map((vendor, i) => (
          <div key={i} className="group">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-base font-black text-gray-900 tracking-tight">{vendor.name}</p>
                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{vendor.location}</p>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-lg ${vendor.status === 'Elite' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                {vendor.status}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out rounded-full ${vendor.performance > 90 ? 'bg-[#10b981]' : 'bg-blue-500'}`}
                style={{ width: `${vendor.performance}%` }}
              ></div>
            </div>
            <div className="flex justify-end mt-2">
               <span className="text-xs font-black text-gray-500 tabular-nums uppercase tracking-tighter">{vendor.performance}% Rating</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorPerformanceTable;
