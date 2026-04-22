import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Activity, Navigation, Phone, CheckCircle, 
  Clock, Zap, MapPin, Wrench, ShieldAlert, X, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Custom Map Icons ---
const sosIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="relative w-12 h-12 flex items-center justify-center">
           <div class="absolute w-full h-full rounded-full bg-red-500/50 animate-ping"></div>
           <div class="absolute w-8 h-8 rounded-full bg-red-500/30 animate-pulse"></div>
           <div class="relative w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-[0_0_20px_#ef4444]"></div>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const serviceCenterIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="relative w-8 h-8 flex items-center justify-center">
           <div class="relative w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px]">
             🔧
           </div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map Updater Component
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// --- Mock Data ---
const SERVICE_CENTERS = [
  { id: 'SC-1', name: 'Apex Service Hub', lat: 28.6100, lng: 77.2100 },
  { id: 'SC-2', name: 'Nexa Repair', lat: 28.6200, lng: 77.1900 },
  { id: 'SC-3', name: 'Volt Mechanics', lat: 28.6050, lng: 77.2200 },
  { id: 'SC-4', name: 'EcoDrive Mechanics', lat: 19.0860, lng: 72.8877 },
];

const INITIAL_ALERTS = [
  { id: 'SOS-001', name: 'Rahul Singh',  vehicle: 'Tata Nexon EV',   type: 'Critical Battery Failure', lat: 28.6139, lng: 77.2090, status: 'UNASSIGNED', timestamp: Date.now() - 250000,  urgency: 1, phone: '+91 98765 43210', battery: '2%'  },
  { id: 'SOS-002', name: 'Anita Kumar',  vehicle: 'MG ZS EV',         type: 'Mechanical Breakdown',    lat: 28.5355, lng: 77.3910, status: 'DISPATCHED', timestamp: Date.now() - 840000,  urgency: 2, phone: '+91 87654 32109', battery: '45%' },
  { id: 'SOS-003', name: 'Vikram Das',   vehicle: 'Hyundai Kona',     type: 'Accident',                lat: 19.0760, lng: 72.8777, status: 'UNASSIGNED', timestamp: Date.now() - 120000,  urgency: 1, phone: '+91 76543 21098', battery: '60%' },
  { id: 'SOS-004', name: 'Priya Sharma', vehicle: 'Kia EV6',          type: 'Stuck on Highway',        lat: 28.5800, lng: 77.1500, status: 'DISPATCHED', timestamp: Date.now() - 480000,  urgency: 2, phone: '+91 77665 54433', battery: '18%' },
  { id: 'SOS-005', name: 'Arjun Mehta',  vehicle: 'Ola Electric S1',  type: 'Charger Not Working',     lat: 28.6400, lng: 77.2300, status: 'UNASSIGNED', timestamp: Date.now() - 65000,   urgency: 2, phone: '+91 99001 12233', battery: '8%'  },
];

const EmergencySOS = () => {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [now, setNow] = useState(Date.now());
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Live Timer Update
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time SOS Simulation — DISABLED for UI preview.
  // When the backend is connected, replace INITIAL_ALERTS with a live socket/API feed.
  // useEffect(() => { ... }, []);

  const formatElapsed = (timestamp) => {
    const diff = Math.floor((now - timestamp) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s ago`;
  };

  const handleDispatch = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'DISPATCHED' } : a));
    setSelectedAlert(prev => prev && prev.id === id ? { ...prev, status: 'DISPATCHED' } : prev);
  };

  const handleResolve = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
    setSelectedAlert(null); // Close panel on resolve
  };

  // Sort: UNASSIGNED Urgency 1 -> UNASSIGNED Urgency 2 -> DISPATCHED -> RESOLVED
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.status === 'RESOLVED' && b.status !== 'RESOLVED') return 1;
    if (b.status === 'RESOLVED' && a.status !== 'RESOLVED') return -1;
    if (a.status === 'UNASSIGNED' && b.status === 'DISPATCHED') return -1;
    if (b.status === 'UNASSIGNED' && a.status === 'DISPATCHED') return 1;
    if (a.status === 'UNASSIGNED' && b.status === 'UNASSIGNED') return a.urgency - b.urgency;
    return b.timestamp - a.timestamp;
  });

  const activeCount = alerts.filter(a => a.status !== 'RESOLVED').length;

  return (
    <div className="bg-[#0f172a] h-[calc(100vh-80px)] p-6 flex flex-col font-['Inter'] text-slate-200 overflow-hidden relative w-full">
      
      {/* 1. SOS Alert Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 flex justify-between items-center shadow-2xl relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-transparent"></div>
        
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Live Feed</span>
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
             ACTIVE EMERGENCIES: <span className="text-red-500 animate-pulse">{activeCount}</span>
          </h2>
        </div>

        <div className="flex flex-col items-center relative z-10 px-10 border-x border-slate-800">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Avg Response Time</span>
          <div className="flex items-center gap-2 mt-1.5">
             <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-1.5 rounded-xl flex items-baseline gap-1 shadow-inner">
               <h2 className="text-3xl font-black text-white tracking-tighter">04</h2>
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">MIN</span>
             </div>
             <span className="text-slate-600 font-black animate-pulse">:</span>
             <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-1.5 rounded-xl flex items-baseline gap-1 shadow-inner">
               <h2 className="text-3xl font-black text-white tracking-tighter">12</h2>
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">SEC</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col items-end relative z-10">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">System Status</span>
          <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
             <Activity className="w-5 h-5 text-emerald-500" />
             <span className="text-sm font-black text-emerald-500 tracking-widest uppercase">Monitoring Live</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* 2. The Live SOS Feed (Left Column) */}
        <div className="flex-[4] min-w-0 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex justify-between items-center shrink-0">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Incoming Alerts
            </h3>
            <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 tracking-widest uppercase">Real-Time</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            <AnimatePresence>
              {sortedAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                    selectedAlert?.id === alert.id ? 'bg-slate-800 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 
                    alert.status === 'RESOLVED' ? 'bg-slate-900/50 border-slate-800 opacity-60' :
                    'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                         alert.urgency === 1 && alert.status !== 'RESOLVED' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                         'bg-slate-700 text-slate-300'
                       }`}>
                         <AlertTriangle className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-sm font-black text-white tracking-wide">{alert.name}</p>
                         <p className="text-[11px] font-bold text-slate-400">{alert.vehicle}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`px-3 py-1.5 rounded-lg border font-mono font-black uppercase tracking-widest flex items-center gap-1.5 ${
                         alert.urgency === 1 && alert.status === 'UNASSIGNED' ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)] text-base' : 'bg-slate-800 text-slate-400 border-slate-700 text-sm'
                       }`}>
                         <Clock className="w-4 h-4" />
                         {formatElapsed(alert.timestamp)}
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Emergency Type</p>
                       <p className={`text-sm font-black tracking-tighter ${alert.urgency === 1 && alert.status !== 'RESOLVED' ? 'text-red-400' : 'text-white'}`}>
                         {alert.type}
                       </p>
                     </div>
                     
                     <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                       alert.status === 'UNASSIGNED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                       alert.status === 'DISPATCHED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                       'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                     }`}>
                       {alert.status}
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {alerts.length === 0 && (
               <div className="text-center py-20">
                  <CheckCircle className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">No Active Emergencies</p>
               </div>
            )}
          </div>
        </div>

        {/* 3. Command Map View (Right Column) */}
        <div className="flex-[6] min-w-0 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl" style={{ minHeight: 0 }}>
          <div className="absolute top-6 left-6 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-xl flex items-center gap-2">
             <MapPin className="w-4 h-4 text-red-500" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Tracking Satellite</span>
          </div>

          <div className="absolute inset-0">
            <MapContainer 
              center={[28.6139, 77.2090]} 
              zoom={11} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
                className="map-tiles"
              />
              {selectedAlert && <MapUpdater center={[selectedAlert.lat, selectedAlert.lng]} />}
              
              {/* SOS Markers */}
              {alerts.filter(a => a.status !== 'RESOLVED').map((alert) => (
                <Marker 
                  key={alert.id} 
                  position={[alert.lat, alert.lng]}
                  icon={sosIcon}
                >
                  <Popup className="custom-popup dark-popup">
                    <div className="p-1">
                      <p className="font-black text-slate-900">{alert.name}</p>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-0.5">{alert.type}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Service Center Overlays */}
              {SERVICE_CENTERS.map((sc) => (
                <Marker key={sc.id} position={[sc.lat, sc.lng]} icon={serviceCenterIcon}>
                   <Popup className="custom-popup dark-popup">
                     <p className="font-black text-[10px] uppercase tracking-widest text-blue-600 m-0">{sc.name}</p>
                   </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

      </div>

      {/* 4. Dispatch & Action Panel (Slide-over) */}
      <AnimatePresence>
        {selectedAlert && selectedAlert.status !== 'RESOLVED' && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-[80px] right-0 bottom-0 w-[450px] bg-[#0f172a] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[9999] border-l border-slate-800 flex flex-col"
          >
            <div className="p-8 bg-slate-900 border-b border-slate-800 flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Alert</p>
                 </div>
                 <h2 className="text-2xl font-black text-white tracking-tighter">{selectedAlert.id}</h2>
               </div>
               <button onClick={() => setSelectedAlert(null)} className="p-3 bg-slate-800 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors">
                 <X className="w-5 h-5 text-slate-300" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
               {/* User Info */}
               <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Victim Profile</h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <p className="text-sm font-bold text-slate-400">Name</p>
                     <p className="text-sm font-black text-white">{selectedAlert.name}</p>
                   </div>
                   <div className="flex justify-between items-center">
                     <p className="text-sm font-bold text-slate-400">Vehicle</p>
                     <p className="text-sm font-black text-white">{selectedAlert.vehicle}</p>
                   </div>
                   <div className="flex justify-between items-center">
                     <p className="text-sm font-bold text-slate-400">Battery Level</p>
                     <p className="text-sm font-black text-red-500 flex items-center gap-1"><Zap className="w-4 h-4"/> {selectedAlert.battery}</p>
                   </div>
                 </div>
               </section>

               {/* Action Buttons */}
               <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Command Center</h3>
                 
                 <button className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between group transition-all">
                   <div className="flex items-center gap-3 text-white">
                     <div className="p-2 bg-slate-900 rounded-lg group-hover:text-blue-500"><Phone className="w-5 h-5" /></div>
                     <div className="text-left">
                       <p className="text-sm font-black uppercase tracking-widest">Contact User</p>
                       <p className="text-[10px] text-slate-400 font-bold">{selectedAlert.phone}</p>
                     </div>
                   </div>
                 </button>

                 {selectedAlert.status === 'UNASSIGNED' ? (
                   <button 
                     onClick={() => handleDispatch(selectedAlert.id)}
                     className="w-full p-4 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl flex items-center justify-between group transition-all shadow-lg shadow-amber-500/20"
                   >
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-amber-900/10 rounded-lg text-amber-900"><Truck className="w-5 h-5" /></div>
                       <div className="text-left">
                         <p className="text-sm font-black uppercase tracking-widest">Smart Dispatch</p>
                         <p className="text-[10px] opacity-80 font-bold">Assign Nearest Service Center</p>
                       </div>
                     </div>
                     <Navigation className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </button>
                 ) : (
                   <button 
                     onClick={() => handleResolve(selectedAlert.id)}
                     className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-between group transition-all shadow-lg shadow-emerald-500/20"
                   >
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-900/20 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
                       <div className="text-left">
                         <p className="text-sm font-black uppercase tracking-widest">Resolve Case</p>
                         <p className="text-[10px] opacity-80 font-bold">Clear Alert from Live Feed</p>
                       </div>
                     </div>
                   </button>
                 )}
               </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .map-tiles {
          filter: brightness(0.85) saturate(0.6) hue-rotate(180deg);
        }
        .dark-popup .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          padding: 0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .dark-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default EmergencySOS;
