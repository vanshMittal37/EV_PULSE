import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { 
  MapPin, Activity, Wrench, Search, Filter, Ban, MessageSquare,
  CheckCircle, Star, Clock, Eye, X, SlidersHorizontal, Battery, Code, Settings, UserCircle, Car,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast, Toaster } from 'react-hot-toast';

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

const ServiceCenters = () => {
  const { searchQuery, setSearchQuery } = useOutletContext();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'MAP'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isSlideoverOpen, setSlideoverOpen] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter for Service and Hybrid vendors
      const serviceVendors = res.data.data
        .filter(v => v.role === 'SERVICE_VENDOR' || v.role === 'HYBRID_VENDOR')
        .map(v => ({
          id: v._id,
          systemId: `SC-${v._id.slice(-4).toUpperCase()}`,
          name: v.businessName || 'Elite Service Hub',
          owner: v.name,
          email: v.email,
          city: v.address?.split(',').pop().trim() || 'Unknown',
          address: v.address,
          specialization: v.specialization ? v.specialization.split(',').map(s => s.trim()) : ['General'],
          type: v.role === 'HYBRID_VENDOR' ? 'HYBRID' : 'SERVICE',
          status: v.status,
          lat: v.locationCoordinates?.lat || 28.6139,
          lng: v.locationCoordinates?.lng || 77.2090,
          rating: 4.8, // Placeholder
          revenue: '₹--L', // Placeholder
          activeJobs: 0, // Placeholder
          technicians: [], // Placeholder
          queue: [] // Placeholder
        }));

      setCenters(serviceVendors);
      setLoading(false);
    } catch (error) {
      console.error('Fetch centers error:', error);
      toast.error('Failed to sync service network');
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter(c => {
    const matchesSearch = c.systemId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'ALL') return matchesSearch;
    if (activeFilter === 'BATTERY') return matchesSearch && c.specialization.some(s => s.toLowerCase().includes('battery'));
    if (activeFilter === 'SOFTWARE') return matchesSearch && c.specialization.some(s => s.toLowerCase().includes('software'));
    if (activeFilter === 'HYBRID') return matchesSearch && c.type === 'HYBRID';
    
    return matchesSearch;
  });

  const getSpecBadge = (spec) => {
    const lowerSpec = spec.toLowerCase();
    if (lowerSpec.includes('battery')) return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1 w-max"><Battery className="w-3 h-3"/> Battery Repair</span>;
    if (lowerSpec.includes('software') || lowerSpec.includes('ota')) return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1 w-max"><Code className="w-3 h-3"/> Software/OTA</span>;
    return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1 w-max"><Settings className="w-3 h-3"/> {spec}</span>;
  };

  return (
    <div className="p-10 max-w-[1700px] mx-auto min-h-screen space-y-10 font-['Inter'] relative overflow-x-hidden">
      <Toaster position="bottom-right" />
      
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
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{centers.length}</h3>
          </div>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Approved Vendors</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Activity className="w-24 h-24 text-purple-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Hybrid Hubs</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{centers.filter(c => c.type === 'HYBRID').length}</h3>
          </div>
          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Dual Capacity</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Ban className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Suspended Centers</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-red-500 tracking-tighter">{centers.filter(c => c.status === 'SUSPENDED').length}</h3>
          </div>
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Action Required</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Star className="w-24 h-24 text-amber-400" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Network Avg. Rating</p>
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-lg group-focus-within:bg-blue-50 transition-colors">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
              </div>
              <input 
                type="text" 
                placeholder="Search by Center ID, Name, or Owner..."
                className="w-full bg-white border-2 border-slate-100 rounded-[1.75rem] py-5 pl-18 pr-8 focus:outline-none focus:border-blue-500 focus:ring-[8px] focus:ring-blue-500/10 transition-all font-bold text-slate-900 text-lg placeholder:text-slate-300 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { id: 'ALL', label: 'All Centers' },
                { id: 'BATTERY', label: 'Battery Specialists' },
                { id: 'SOFTWARE', label: 'Software Experts' },
                { id: 'HYBRID', label: 'Hybrid Hubs' }
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

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Center Identity</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Location & Owner</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Specialization</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Service Registry...</p>
                      </td>
                    </tr>
                  ) : filteredCenters.map((center) => (
                    <tr key={center.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-10 py-8">
                        <p className="text-xl font-black text-slate-900 tracking-tighter mb-1 group-hover:text-blue-600 transition-colors">{center.name}</p>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           {center.systemId} {center.type === 'HYBRID' && <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded uppercase tracking-widest font-black">Hybrid Hub</span>}
                        </p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-lg font-black text-slate-700 tracking-tight">{center.city}</p>
                        <p className="text-sm font-bold text-slate-400 mt-0.5 flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5"/> {center.owner}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                          {center.specialization.map((spec, i) => (
                            <React.Fragment key={i}>{getSpecBadge(spec)}</React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          center.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          center.status === 'SUSPENDED' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {center.status}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                           <button 
                             onClick={() => { setSelectedCenter(center); setSlideoverOpen(true); }}
                             className="p-3 bg-white text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-slate-100 hover:border-blue-600 shadow-sm hover:shadow-xl inline-flex group/btn"
                           >
                             <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredCenters.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-10 py-20 text-center">
                        <Wrench className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">No Service Hubs Found</h3>
                        <p className="text-slate-500 font-bold">Try adjusting your search or filters.</p>
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
           <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative z-10">
              <MapContainer 
                center={[21.1458, 79.0882]} 
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
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
           </div>
           
           <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-6">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse"></div>
                   <span className="text-xs font-black text-white uppercase tracking-widest">Service Only ({centers.filter(c => c.type === 'SERVICE').length})</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] animate-pulse"></div>
                   <span className="text-xs font-black text-white uppercase tracking-widest">Hybrid Hubs ({centers.filter(c => c.type === 'HYBRID').length})</span>
                 </div>
              </div>
           </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isSlideoverOpen && selectedCenter && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSlideoverOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-[110] border-l border-slate-100 flex flex-col"
            >
              <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{selectedCenter.name}</h2>
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                     ID: {selectedCenter.systemId} <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {selectedCenter.city}
                   </p>
                 </div>
                 <button onClick={() => setSlideoverOpen(false)} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
                   <X className="w-5 h-5 text-slate-500" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Owner Contact</p>
                   <p className="text-xl font-black text-blue-700 tracking-tight">{selectedCenter.owner}</p>
                   <p className="text-sm font-bold text-blue-500/70">{selectedCenter.email}</p>
                 </div>

                 <section>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Wrench className="w-4 h-4"/> Service Specializations
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {selectedCenter.specialization.map((spec, idx) => (
                       <React.Fragment key={idx}>{getSpecBadge(spec)}</React.Fragment>
                     ))}
                   </div>
                 </section>

                 <section>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <MapPin className="w-4 h-4"/> Center Location
                   </h3>
                   <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">{selectedCenter.address || 'Location details not provided'}</p>
                   </div>
                 </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 1rem; padding: 0; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .custom-popup .leaflet-popup-content { margin: 0; }
        .custom-leaflet-icon { background: transparent; border: none; }
        .map-tiles { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7); }
      `}</style>
    </div>
  );
};

export default ServiceCenters;

