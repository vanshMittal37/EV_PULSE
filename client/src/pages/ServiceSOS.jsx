import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Phone, MapPin, Clock, User, ChevronDown,
  Radio, VolumeX, Volume2, CheckCircle, Navigation, Zap,
  Shield, Send, ArrowRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const PROGRESS_STEPS = ['Dispatched', 'On-Site', 'Resolved'];

const MOCK_ALERTS = [
  {
    customer: 'Ravi Kumar', phone: '+91 98765 43210', vehicle: 'Tata Nexon EV',
    plate: 'DL 3C AY 1234', issue: 'Sudden Power Loss — Vehicle stalled on highway',
    urgency: 'Critical', lat: 28.6139, lng: 77.209,
    location: 'NH-48, Near Manesar Toll Plaza, Gurugram'
  },
  {
    customer: 'Meera Jain', phone: '+91 88776 55443', vehicle: 'MG ZS EV',
    plate: 'HR 26 CQ 7890', issue: 'Battery Drained — SOC at 0%, stranded',
    urgency: 'Critical', lat: 28.4595, lng: 77.0266,
    location: 'Sector 29, Gurugram, Near Huda Metro'
  },
  {
    customer: 'Ajay Thakur', phone: '+91 77665 54433', vehicle: 'Hyundai Kona',
    plate: 'DL 8C BX 4567', issue: 'Flat Tire — Rear left punctured',
    urgency: 'Standard', lat: 28.5355, lng: 77.391,
    location: 'Noida Expressway, Sector 62 Exit'
  },
];

const ServiceSOS = () => {
  const [alerts, setAlerts] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [muted, setMuted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [seeded, setSeeded] = useState(false);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API}/sos`, { headers: headers() });
      const data = await res.json();
      if (data.success) setAlerts(data.data);
    } catch (err) { console.error(err); }
  };

  // Fetch technicians
  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API}/auth/technicians`, { headers: headers() });
      const data = await res.json();
      if (data.success) setTechnicians(data.data);
    } catch (err) { console.error(err); }
  };

  // Seed mock alerts if empty
  const seedAlerts = async () => {
    try {
      for (const alert of MOCK_ALERTS) {
        await fetch(`${API}/sos`, { method: 'POST', headers: headers(), body: JSON.stringify(alert) });
      }
      fetchAlerts();
      setSeeded(true);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAlerts();
    fetchTechnicians();
    const poll = setInterval(fetchAlerts, 5000); // Poll every 5s for technician updates
    return () => clearInterval(poll);
  }, []);

  const getElapsed = (createdAt) => {
    const diff = Math.floor((now - new Date(createdAt).getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const isOverdue = (createdAt) => (now - new Date(createdAt).getTime()) > 5 * 60 * 1000;

  const handleDispatch = async (alertId, tech) => {
    try {
      const res = await fetch(`${API}/sos/${alertId}/dispatch`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ technicianId: tech._id })
      });
      const data = await res.json();
      if (data.success) {
        fetchAlerts();
        toast.success(`${tech.name} dispatched!`, {
          style: { background: '#10b981', color: '#0f172a', fontWeight: '900' }
        });
      }
    } catch (err) { console.error(err); }
  };

  const pendingAlerts = alerts.filter(a => a.status === 'Pending');
  const activeAlerts = alerts.filter(a => ['Dispatched', 'On-Site'].includes(a.status));
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved');

  const getProgressIndex = (status) => {
    const idx = PROGRESS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="relative min-h-full pb-24">
      <Toaster position="top-center" />
      <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter">Live Emergency Feed</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-xs font-black text-red-400 uppercase tracking-widest">Live</span>
                </div>
                <span className="text-xs font-bold text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-500">{pendingAlerts.length} pending • {activeAlerts.length} active</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {alerts.length === 0 && (
              <button onClick={seedAlerts}
                className="px-6 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-500/20 transition-colors">
                Load Demo Alerts
              </button>
            )}
            <button onClick={() => setMuted(!muted)}
              className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all border ${
                muted ? 'bg-slate-800 text-slate-400 border-white/10' : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              {muted ? 'Muted' : 'Mute'}
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', value: pendingAlerts.length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', Icon: AlertTriangle },
            { label: 'Dispatched', value: activeAlerts.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', Icon: Navigation },
            { label: 'Resolved', value: resolvedAlerts.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: CheckCircle },
            { label: 'Avg Response', value: '4m', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', Icon: Clock },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#1e293b] rounded-2xl p-5 border border-white/5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} border flex items-center justify-center shrink-0`}>
                <kpi.Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                <p className={`text-3xl font-black text-white ${MONO}`}>{kpi.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PENDING ALERTS */}
        {pendingAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Pending — Immediate Action Required
            </h2>
            <AnimatePresence mode="popLayout">
              {pendingAlerts.map((alert, idx) => {
                const overdue = isOverdue(alert.createdAt);
                return (
                  <motion.div key={alert._id} layout
                    initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
                    className={`bg-[#1e293b] rounded-3xl border-2 overflow-hidden transition-all ${
                      overdue ? 'border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse-slow' : 'border-white/5'
                    }`}>
                    <div className={`px-6 py-2 flex items-center justify-between ${
                      alert.urgency === 'Critical' ? 'bg-red-500/10' : 'bg-amber-500/10'
                    }`}>
                      <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                        alert.urgency === 'Critical' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        <AlertTriangle className="w-4 h-4" /> {alert.urgency}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${overdue ? 'text-red-400' : 'text-slate-400'} ${MONO}`}>
                        <Clock className="w-4 h-4" /> Waiting {getElapsed(alert.createdAt)}
                      </span>
                    </div>

                    <div className="p-6 lg:p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Customer + Vehicle */}
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-lg text-white shrink-0">
                              {alert.customer.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-white">{alert.customer}</h3>
                              <p className={`text-sm font-bold text-slate-400 ${MONO}`}>{alert.phone}</p>
                            </div>
                          </div>
                          <a href={`tel:${alert.phone.replace(/\s/g, '')}`}
                            className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-sm uppercase tracking-widest transition-colors">
                            <Phone className="w-4 h-4" /> Quick Call
                          </a>
                          <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle</p>
                            <p className="text-base font-black text-white">{alert.vehicle}</p>
                            <p className={`text-sm font-black text-blue-400 ${MONO}`}>{alert.plate}</p>
                          </div>
                        </div>

                        {/* Issue + Location */}
                        <div className="space-y-4">
                          <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Reported Issue</p>
                            <p className={`text-base font-black ${alert.urgency === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                              <Zap className="w-4 h-4 inline mr-1.5" />{alert.issue}
                            </p>
                          </div>
                          <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5 space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Live Location
                            </p>
                            <p className="text-sm font-bold text-slate-300">{alert.location}</p>
                            <a href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">
                              <Navigation className="w-4 h-4" /> View on Google Maps <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Dispatch */}
                        <div className="bg-[#0f172a] rounded-2xl p-5 border border-red-500/10 space-y-4">
                          <p className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-400" /> Dispatch Technician
                          </p>
                          {technicians.length > 0 ? (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                              {technicians.map(tech => (
                                <button key={tech._id} onClick={() => handleDispatch(alert._id, tech)}
                                  className="w-full flex items-center gap-3 p-3 bg-[#1e293b] hover:bg-white/10 border border-white/5 rounded-xl transition-colors text-left group">
                                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-sm text-white shrink-0">
                                    {tech.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white truncate">{tech.name}</p>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Available</p>
                                  </div>
                                  <Send className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm font-bold text-slate-500 text-center py-4">No technicians available. Add them in Technician Hub.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ACTIVE — Technician Dispatched (no advance button) */}
        {activeAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Active — Technician Dispatched
            </h2>
            {activeAlerts.map(alert => {
              const progressIdx = getProgressIndex(alert.status);
              return (
                <motion.div key={alert._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-[#1e293b] rounded-3xl border border-amber-500/20 overflow-hidden">
                  <div className="p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-base text-white shrink-0">
                          {alert.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-white">{alert.customer}</h3>
                            <span className={`text-xs font-black text-blue-400 ${MONO}`}>#{alert._id.slice(-6).toUpperCase()}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-400">{alert.vehicle} • {alert.plate} • {alert.issue.split('—')[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#0f172a] px-5 py-3 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-sm text-emerald-400 shrink-0">
                          {alert.technicianId?.name ? alert.technicianId.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{alert.technicianId?.name || 'Unknown'}</p>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Assigned</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Tracker — read-only, updated by technician */}
                    <div className="mt-8 flex items-center gap-0">
                      {PROGRESS_STEPS.map((step, i) => {
                        const done = progressIdx > i;
                        const current = progressIdx === i;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center gap-2 flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                                done ? 'bg-emerald-500 border-emerald-500 text-[#0f172a]'
                                  : current ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                  : 'bg-slate-800 border-slate-700 text-slate-500'
                              }`}>
                                {done ? <CheckCircle className="w-5 h-5" /> : i + 1}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest text-center ${
                                done ? 'text-emerald-400' : current ? 'text-amber-400' : 'text-slate-500'
                              }`}>{step}</span>
                            </div>
                            {i < PROGRESS_STEPS.length - 1 && (
                              <div className={`flex-1 h-1 rounded-full mx-1 mt-[-20px] ${done ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <p className="text-xs font-bold text-slate-500 text-center mt-4 italic">
                      Status is updated by the assigned technician in real-time.
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* RESOLVED */}
        {resolvedAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Resolved
            </h2>
            {resolvedAlerts.map(alert => (
              <div key={alert._id} className="bg-[#1e293b]/60 rounded-2xl p-6 border border-emerald-500/10 flex items-center justify-between opacity-70">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white">{alert.customer} — {alert.vehicle}</p>
                    <p className="text-xs font-bold text-slate-500">{alert.issue.split('—')[0]} • Handled by {alert.technicianId?.name || 'Tech'}</p>
                  </div>
                </div>
                <span className={`text-xs font-black text-emerald-400 uppercase tracking-widest ${MONO}`}>#{alert._id.slice(-6).toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {alerts.length === 0 && (
          <div className="py-20 bg-[#1e293b]/50 border-2 border-dashed border-white/5 rounded-3xl text-center">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-lg font-black text-white">No active emergencies.</p>
            <p className="text-sm font-bold text-slate-500 mt-2">Click "Load Demo Alerts" to simulate SOS requests.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-slow { 0%,100%{border-color:rgba(239,68,68,0.2)} 50%{border-color:rgba(239,68,68,0.6)} }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ServiceSOS;

