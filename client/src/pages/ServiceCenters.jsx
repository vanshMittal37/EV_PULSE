import React, { useState } from 'react';
import { 
  MapPin, Activity, Wrench, Search, Filter, Ban, MessageSquare,
  CheckCircle, Star, Clock, Eye, X, SlidersHorizontal, Battery, Code, Settings, UserCircle, Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map Icons
const createServiceIcon = (type) => {
  const color = type === 'HYBRID' ? 'purple' : 'blue';
  const label = type === 'HYBRID' ? '⚡🔧' : '🔧';
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="relative w-8 h-8 flex items-center justify-center">
             <div class="absolute w-full h-full rounded-full bg-${color}-500/40 animate-ping"></div>
             <div class="relative w-6 h-6 rounded-full bg-${color}-500 border-2 border-white shadow-[0_0_15px_${color}] flex items-center justify-center text-[10px]">
               ${label}
             </div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const serviceIcon = createServiceIcon('SERVICE');
const hybridIcon = createServiceIcon('HYBRID');

const DUMMY_CENTERS = [
  { id: 'SC-8012', name: 'Apex EV Service', vendor: 'Mishra Group', city: 'Delhi', specialization: ['Battery Repair', 'General'], activeJobs: 45, rating: 4.8, lat: 28.6139, lng: 77.2090, type: 'SERVICE', technicians: ['Arjun K.', 'Ravi S.', 'Pooja T.'], revenue: '₹4.2L', queue: ['DL-1C-AB-1234', 'HR-26-CD-5678', 'DL-8C-XX-9911', 'UP-14-EF-3321'] },
  { id: 'SC-1029', name: 'Nexa Software Hub', vendor: 'T. Verma', city: 'Bangalore', specialization: ['Software/OTA'], activeJobs: 12, rating: 4.9, lat: 12.9716, lng: 77.5946, type: 'SERVICE', technicians: ['Sunil M.'], revenue: '₹8.5L', queue: ['KA-01-EE-9999', 'KA-03-AA-1122'] },
  { id: 'SC-3341', name: 'EcoDrive Mechanics', vendor: 'J. Doe', city: 'Mumbai', specialization: ['General'], activeJobs: 5, rating: 4.1, lat: 19.0760, lng: 72.8777, type: 'SERVICE', technicians: ['Meera P.', 'Raj D.'], revenue: '₹2.1L', queue: ['MH-02-XY-8888'] },
  { id: 'SC-9900', name: 'Hybrid Power Station', vendor: 'K. Patel', city: 'Pune', specialization: ['Battery Repair', 'Software/OTA', 'General'], activeJobs: 82, rating: 4.6, lat: 18.5204, lng: 73.8567, type: 'HYBRID', technicians: ['Amit K.', 'Suresh L.', 'Priya M.', 'Neha B.'], revenue: '₹12.4L', queue: ['MH-12-PQ-1122', 'MH-14-AA-3344', 'MH-12-ZZ-9900', 'GJ-01-BB-7777', 'MH-12-CC-5555'] },
  { id: 'SC-4411', name: 'Volt Battery Experts', vendor: 'S. Sharma', city: 'Chennai', specialization: ['Battery Repair'], activeJobs: 28, rating: 4.5, lat: 13.0827, lng: 80.2707, type: 'SERVICE', technicians: ['Vinay G.', 'Kumar R.'], revenue: '₹6.8L', queue: ['TN-01-XX-1234', 'TN-22-YY-5678'] },
];

const ServiceCenters = () => {
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'MAP'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isSlideoverOpen, setSlideoverOpen] = useState(false);

  const filteredCenters = DUMMY_CENTERS.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'ALL') return matchesSearch;
    if (activeFilter === 'BATTERY') return matchesSearch && c.specialization.includes('Battery Repair');
    if (activeFilter === 'SOFTWARE') return matchesSearch && c.specialization.includes('Software/OTA');
    if (activeFilter === 'HIGH_LOAD') return matchesSearch && c.activeJobs >= 30;
    if (activeFilter === 'AVAILABLE') return matchesSearch && c.activeJobs < 10;
    
    return matchesSearch;
  });

  const getSpecBadge = (spec) => {
    switch (spec) {
      case 'Battery Repair': return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1 w-max"><Battery className="w-3 h-3"/> Battery Repair</span>;
      case 'Software/OTA': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1 w-max"><Code className="w-3 h-3"/> Software/OTA</span>;
      case 'General': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1 w-max"><Settings className="w-3 h-3"/> General</span>;
      default: return null;
    }
  };

  return (
    <div className="p-10 max-w-[1700px] mx-auto min-h-screen space-y-10 font-['Inter'] relative overflow-x-hidden">
      
      {/* Header & Quick Toggle */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl">
               <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Service Center Management</h1>
              <p className="text-slate-500 font-bold tracking-wide uppercase text-xs flex items-center gap-2">
                Network Repair Logistics <span className="w-1 h-1 rounded-full bg-slate-300"></span> Workload & Capability Auditing
              </p>
            </div>
          </div>
        </div>
        
        {/* View Switcher */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200/50">
          <button 
            onClick={() => setViewMode('LIST')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'LIST' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Registry List
          </button>
          <button 
            onClick={() => setViewMode('MAP')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'MAP' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MapPin className="w-4 h-4" /> Service Map
          </button>
        </div>
      </div>

      {/* Service-Specific Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Wrench className="w-24 h-24 text-blue-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Service Hubs</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">48</h3>
          </div>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Approved Vendors</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Activity className="w-24 h-24 text-amber-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Active Repair Jobs</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">172</h3>
          </div>
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Network Workload</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Clock className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Avg. Service Time</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">4.2<span className="text-2xl">hr</span></h3>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">-0.5hr from last week</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Star className="w-24 h-24 text-amber-400" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Network Rating</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">4.8<span className="text-2xl text-slate-300">/5</span></h3>
          </div>
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Customer Feedback</p>
        </div>
      </div>

      {viewMode === 'LIST' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-lg group-focus-within:bg-blue-50 transition-colors">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
              </div>
              <input 
                type="text" 
                placeholder="Search by Center ID, Name, or Vendor..."
                className="w-full bg-white border-2 border-slate-100 rounded-[1.75rem] py-5 pl-18 pr-8 focus:outline-none focus:border-blue-500 focus:ring-[8px] focus:ring-blue-500/10 transition-all font-bold text-slate-900 text-lg placeholder:text-slate-300 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { id: 'ALL', label: 'All Centers' },
                { id: 'BATTERY', label: 'Battery Specialists' },
                { id: 'SOFTWARE', label: 'Software Experts' },
                { id: 'HIGH_LOAD', label: 'High Load' },
                { id: 'AVAILABLE', label: 'Available' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                    activeFilter === filter.id 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' 
                      : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Registry Table */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Center Identity</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Location & Owner</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Specialization</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Workload & Rating</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {filteredCenters.map((center) => (
                    <tr key={center.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-10 py-8">
                        <p className="text-xl font-black text-slate-900 tracking-tighter mb-1 group-hover:text-blue-600 transition-colors">{center.name}</p>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           {center.id} {center.type === 'HYBRID' && <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded uppercase tracking-widest font-black">Hybrid Hub</span>}
                        </p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-lg font-black text-slate-700 tracking-tight">{center.city}</p>
                        <p className="text-sm font-bold text-slate-400 mt-0.5 flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5"/> {center.vendor}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                          {center.specialization.map((spec, i) => (
                            <React.Fragment key={i}>{getSpecBadge(spec)}</React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center gap-2">
                             <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${center.activeJobs > 30 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                               {center.activeJobs} Pending Tickets
                             </div>
                           </div>
                           <div className="flex items-center gap-1.5 text-sm font-black text-slate-700">
                             <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {center.rating} / 5
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                           <button 
                             onClick={() => { setSelectedCenter(center); setSlideoverOpen(true); }}
                             className="p-3 bg-white text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-slate-100 hover:border-blue-600 shadow-sm hover:shadow-xl inline-flex group/btn"
                             title="View Details"
                           >
                             <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                           </button>
                           <button 
                             className="p-3 bg-white text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all border border-slate-100 hover:border-slate-900 shadow-sm hover:shadow-xl inline-flex group/btn"
                             title="Contact Vendor"
                           >
                             <MessageSquare className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                           </button>
                           <button 
                             className="p-3 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm hover:shadow-xl inline-flex group/btn"
                             title="Suspend Center"
                           >
                             <Ban className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCenters.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-10 py-20 text-center">
                        <Wrench className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">No Service Hubs Found</h3>
                        <p className="text-slate-500 font-bold">Try adjusting your search or specialization filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {viewMode === 'MAP' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-4 border-slate-800 h-[700px] relative overflow-hidden"
        >
           {/* Map Container */}
           <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative z-10">
              <MapContainer 
                center={[21.1458, 79.0882]} // Center of India
                zoom={5} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  className="map-tiles"
                />
                {filteredCenters.map((center) => (
                  <Marker 
                    key={center.id} 
                    position={[center.lat, center.lng]}
                    icon={center.type === 'HYBRID' ? hybridIcon : serviceIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedCenter(center);
                        setSlideoverOpen(true);
                      },
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2">
                        <h4 className="font-black text-slate-900 text-sm tracking-tighter">{center.name}</h4>
                        <div className="flex gap-1 flex-wrap mt-2">
                           {center.specialization.map((spec, i) => (
                              <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{spec}</span>
                           ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{center.activeJobs} Jobs</span>
                           <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500"/> {center.rating}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
           </div>
           
           {/* Map Overlay Info */}
           <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-6">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse"></div>
                   <span className="text-xs font-black text-white uppercase tracking-widest">Service Only ({DUMMY_CENTERS.filter(c => c.type === 'SERVICE').length})</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] animate-pulse"></div>
                   <span className="text-xs font-black text-white uppercase tracking-widest">Hybrid Hubs ({DUMMY_CENTERS.filter(c => c.type === 'HYBRID').length})</span>
                 </div>
              </div>
           </div>
        </motion.div>
      )}

      {/* Slide-over Panel for Center Details */}
      <AnimatePresence>
        {isSlideoverOpen && selectedCenter && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSlideoverOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-[110] border-l border-slate-100 flex flex-col"
            >
              <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{selectedCenter.name}</h2>
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                     ID: {selectedCenter.id} <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {selectedCenter.city}
                   </p>
                 </div>
                 <button onClick={() => setSlideoverOpen(false)} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
                   <X className="w-5 h-5 text-slate-500" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 {/* Rating & Revenue */}
                 <div className="flex gap-4">
                   <div className="flex-1 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                     <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Customer Rating</p>
                     <p className="text-2xl font-black text-amber-700 tracking-tight flex items-center gap-2"><Star className="w-6 h-6 fill-amber-500 text-amber-500"/> {selectedCenter.rating} <span className="text-sm text-amber-600/50">/ 5</span></p>
                   </div>
                   <div className="flex-1 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Monthly Revenue</p>
                     <p className="text-2xl font-black text-emerald-700 tracking-tight">{selectedCenter.revenue}</p>
                   </div>
                 </div>

                 {/* Technicians */}
                 <section>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <UserCircle className="w-4 h-4"/> Certified Technicians
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                     {selectedCenter.technicians.map((tech, idx) => (
                       <div key={idx} className="p-3 border border-slate-100 rounded-xl flex items-center gap-3 bg-white shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">{tech.charAt(0)}</div>
                          <p className="text-xs font-black text-slate-700">{tech}</p>
                       </div>
                     ))}
                   </div>
                 </section>

                 {/* Current Queue */}
                 <section>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Car className="w-4 h-4"/> Active Service Queue ({selectedCenter.activeJobs} Total)
                   </h3>
                   <div className="space-y-3">
                     {selectedCenter.queue.map((plate, idx) => (
                       <div key={idx} className="p-4 border-2 border-slate-100 rounded-2xl flex justify-between items-center bg-slate-50">
                          <div className="flex items-center gap-3">
                             <div className="px-3 py-1.5 bg-yellow-400 rounded border-2 border-slate-900 font-mono font-bold text-slate-900 text-sm tracking-widest shadow-sm">
                               {plate}
                             </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                            <Clock className="w-3 h-3"/> In Bay {idx + 1}
                          </span>
                       </div>
                     ))}
                     {selectedCenter.activeJobs > selectedCenter.queue.length && (
                       <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex justify-center items-center">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">+ {selectedCenter.activeJobs - selectedCenter.queue.length} more in queue</p>
                       </div>
                     )}
                   </div>
                 </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 1rem;
          padding: 0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
      `}</style>
    </div>
  );
};

export default ServiceCenters;
