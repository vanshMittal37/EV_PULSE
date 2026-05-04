import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { 
  MapPin, Activity, Zap, ServerCrash, Search, Filter,
  CheckCircle, AlertTriangle, Eye, RefreshCw, X, SlidersHorizontal, BatteryCharging, Plug, Cpu, Users,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast, Toaster } from 'react-hot-toast';

// Custom Map Icons
const createPulsingIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="relative w-6 h-6 flex items-center justify-center">
             <div class="absolute w-full h-full rounded-full bg-${color}-500/30 animate-ping"></div>
             <div class="relative w-3 h-3 rounded-full bg-${color}-500 border-2 border-white shadow-[0_0_10px_${color}]"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const activeIcon = createPulsingIcon('emerald');
const offlineIcon = createPulsingIcon('red');
const maintenanceIcon = createPulsingIcon('amber');

const StationNetwork = () => {
  const { searchQuery, setSearchQuery } = useOutletContext();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'MAP'
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState(null);
  const [isSlideoverOpen, setSlideoverOpen] = useState(false);
  const [rebooting, setRebooting] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map vendors (who are effectively stations) to the station format
      const mappedStations = res.data.data
        .filter(v => v.role === 'STATION_VENDOR' || v.role === 'HYBRID_VENDOR')
        .map(v => ({
          id: v._id,
          systemId: `ST-${v._id.slice(-4).toUpperCase()}`,
          name: v.businessName || 'EcoCharge Partner',
          city: v.address?.split(',').pop().trim() || 'Unknown',
          address: v.address,
          ports: v.portTypes || ['Type 2'],
          numPorts: v.numberOfPorts || 2,
          status: v.status === 'ACTIVE' ? (v.stationStatus || 'Active') : 'Offline',
          vendorStatus: v.status,
          lat: v.locationCoordinates?.lat || 28.6139, 
          lng: v.locationCoordinates?.lng || 77.2090,
          uptime: '99.9%', 
          power: '150kW',   
          email: v.email,
          owner: v.name,
          createdAt: v.createdAt
        }));

      setStations(mappedStations);
      setLoading(false);
    } catch (error) {
      console.error('Fetch stations error:', error);
      toast.error('Failed to sync network data');
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(s => {
    const matchesSearch = s.systemId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'ALL') return matchesSearch;
    if (activeFilter === 'OFFLINE') return matchesSearch && s.status === 'Offline';
    if (activeFilter === 'MAINTENANCE') return matchesSearch && s.status === 'Maintenance';
    if (activeFilter === 'ACTIVE') return matchesSearch && s.status === 'Active';
    
    return matchesSearch;
  });

  const handleReboot = () => {
    setRebooting(true);
    setTimeout(() => {
      setRebooting(false);
      toast.success('Remote reboot command sequence complete', {
        style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' }
      });
    }, 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 w-max"><CheckCircle className="w-3 h-3"/> Active</span>;
      case 'Offline': return <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 flex items-center gap-1.5 w-max"><ServerCrash className="w-3 h-3"/> Offline</span>;
      case 'Maintenance': return <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5 w-max"><AlertTriangle className="w-3 h-3"/> Maintenance</span>;
      default: return null;
    }
  };

  return (
    <div className="p-10 max-w-[1700px] mx-auto min-h-screen space-y-10 font-['Inter'] relative overflow-x-hidden">
      <Toaster position="bottom-right" />
      
      {/* Header & Quick Toggle */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl">
               <Zap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Station Network Infrastructure</h1>
              <p className="text-slate-500 font-bold tracking-wide uppercase text-xs flex items-center gap-2">
                Global Network Control <span className="w-1 h-1 rounded-full bg-slate-300"></span> Live Telemetry & Health Monitoring
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
            <MapPin className="w-4 h-4" /> Interactive Map
          </button>
        </div>
      </div>

      {/* Network Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Activity className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Network Nodes</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{stations.length}</h3>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10"><CheckCircle className="w-3 h-3"/> Active Registry</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <ServerCrash className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Stations Offline</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-red-500 tracking-tighter">{stations.filter(s => s.status === 'Offline').length}</h3>
          </div>
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10"><AlertTriangle className="w-3 h-3"/> Requires Attention</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <BatteryCharging className="w-24 h-24 text-blue-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Maintenance Mode</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{stations.filter(s => s.status === 'Maintenance').length}</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Scheduled Service</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Plug className="w-24 h-24 text-[#10b981]" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Active Ports</p>
          <div className="flex items-end gap-3 relative z-10">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{stations.reduce((acc, s) => acc + (s.status === 'Active' ? s.numPorts : 0), 0)}</h3>
          </div>
          <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mt-4 flex items-center gap-1.5 relative z-10">Live Grid Capacity</p>
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
              <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-lg group-focus-within:bg-emerald-50 transition-colors">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#10b981]" />
              </div>
              <input 
                type="text" 
                placeholder="Search by Station ID or Vendor Name..."
                className="w-full bg-white border-2 border-slate-100 rounded-[1.75rem] py-5 pl-18 pr-8 focus:outline-none focus:border-[#10b981] focus:ring-[8px] focus:ring-emerald-500/10 transition-all font-bold text-slate-900 text-lg placeholder:text-slate-300 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { id: 'ALL', label: 'All Stations' },
                { id: 'ACTIVE', label: 'Active Now' },
                { id: 'OFFLINE', label: 'Offline Only' },
                { id: 'MAINTENANCE', label: 'Maintenance' }
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
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Vendor / Station Name</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Station Location</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Hardware Spec</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em]">Current Status</th>
                    <th className="px-10 py-8 text-[11px] font-black text-slate-100 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Updating Live Registry...</p>
                      </td>
                    </tr>
                  ) : filteredStations.map((station) => (
                    <tr key={station.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-10 py-8">
                        <p className="text-xl font-black text-slate-900 tracking-tighter mb-1 group-hover:text-[#10b981] transition-colors">{station.name}</p>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{station.systemId}</p>
                        {station.vendorStatus === 'SUSPENDED' && (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
                            Vendor Suspended — Station Offline
                          </span>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-lg font-black text-slate-700 tracking-tight">{station.city}</p>
                        <p className="text-sm font-bold text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <Plug className="w-3.5 h-3.5 text-blue-400"/> {station.numPorts} Port{station.numPorts > 1 ? 's' : ''}
                        </p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-wrap gap-2">
                          {station.ports.map((port, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100/50 flex items-center gap-1">
                              <Plug className="w-3 h-3"/> {port}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500"/> Peak Output: {station.power}
                        </p>
                      </td>
                      <td className="px-10 py-8">
                        {getStatusBadge(station.status)}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => { setSelectedStation(station); setSlideoverOpen(true); }}
                          className="p-4 bg-white text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-slate-900 shadow-sm hover:shadow-xl inline-flex"
                        >
                          <Eye className="w-5.5 h-5.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredStations.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-10 py-20 text-center">
                        <ServerCrash className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">No Stations Found</h3>
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
                {filteredStations.map((station) => (
                  <Marker 
                    key={station.id} 
                    position={[station.lat, station.lng]}
                    icon={station.status === 'Active' ? activeIcon : station.status === 'Maintenance' ? maintenanceIcon : offlineIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedStation(station);
                        setSlideoverOpen(true);
                      },
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2">
                        <h4 className="font-black text-slate-900 text-sm tracking-tighter">{station.name}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1"><Zap className="w-3 h-3 text-[#10b981]"/> {station.power}</p>
                        <div className="mt-3">
                          {getStatusBadge(station.status)}
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
                   <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                   <span className="text-xs font-black text-white uppercase tracking-widest">Active ({stations.filter(s => s.status === 'Active').length})</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse"></div>
                   <span className="text-xs font-black text-white uppercase tracking-widest">Offline ({stations.filter(s => s.status === 'Offline').length})</span>
                 </div>
              </div>
           </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isSlideoverOpen && selectedStation && (
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
                   <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{selectedStation.name}</h2>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Vendor &amp; Station — 1:1 Sole Operator</p>
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                     ID: {selectedStation.systemId} <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {selectedStation.city} <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {selectedStation.numPorts} Ports
                   </p>
                   {selectedStation.vendorStatus === 'SUSPENDED' && (
                     <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 w-max">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                       Vendor Suspended — Station Forced Offline
                     </div>
                   )}
                 </div>
                 <button onClick={() => setSlideoverOpen(false)} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
                   <X className="w-5 h-5 text-slate-500" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 <div className="flex gap-4">
                   <div className="flex-1 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                     <div className="mt-2">{getStatusBadge(selectedStation.status)}</div>
                   </div>
                   <div className="flex-1 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uptime (30d)</p>
                     <p className="text-xl font-black text-slate-900 tracking-tight">{selectedStation.uptime}</p>
                   </div>
                 </div>

                 <section>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Cpu className="w-4 h-4"/> Hardware Telemetry
                   </h3>
                   <div className="space-y-4">
                     {selectedStation.ports.map((port, idx) => (
                       <div key={idx} className="p-5 border-2 border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors group">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><Plug className="w-5 h-5"/></div>
                               <div>
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Gun {idx + 1} - {port}</p>
                                 <p className="text-[10px] font-bold text-slate-400">Connector Type: Standard</p>
                               </div>
                            </div>
                            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                             <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temp</p>
                               <p className="text-sm font-black text-slate-700">32°C</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Voltage</p>
                               <p className="text-sm font-black text-slate-700">380V</p>
                             </div>
                          </div>
                       </div>
                     ))}
                   </div>
                 </section>

                 <section className="pt-4">
                   <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col gap-4">
                     <div className="flex gap-4">
                       <div className="p-3 bg-white rounded-xl shadow-sm border border-red-100 h-max text-red-500">
                         <RefreshCw className="w-6 h-6" />
                       </div>
                       <div>
                         <h4 className="text-sm font-black text-red-700 uppercase tracking-widest">Remote Reboot</h4>
                         <p className="text-xs font-bold text-red-500/80 mt-1 leading-relaxed">Sends a hard-reset command to the station controller. Use only if station is unresponsive.</p>
                       </div>
                     </div>
                     <button 
                       onClick={handleReboot}
                       disabled={rebooting}
                       className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       {rebooting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Force Remote Reboot'}
                     </button>
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

export default StationNetwork;

