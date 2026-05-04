import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, LogOut, Clock, Wrench, AlertTriangle, MapPin, Phone, Navigation, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const STATUS_OPTIONS = ['Diagnostic', 'In-Repair', 'Parts Pending', 'Quality Check', 'Ready for Delivery', 'Completed'];

const getStatusColor = (status) => {
  switch (status) {
    case 'Diagnostic': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'In-Repair': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Parts Pending': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
    case 'Quality Check': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'Ready for Delivery': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Completed': return 'bg-slate-700/50 text-slate-400 border-slate-600';
    default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
  }
};

const TechnicianDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/jobs`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (err) { console.error(err); }
  };

  const fetchSOS = async () => {
    try {
      const res = await fetch(`${API}/sos`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setSosAlerts(data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    Promise.all([fetchJobs(), fetchSOS()]).finally(() => setLoading(false));
    const poll = setInterval(fetchSOS, 5000);
    return () => clearInterval(poll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const updateJobStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/jobs/${id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ status: newStatus, notes: `Status changed to ${newStatus} by technician.` })
      });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs.map(j => j._id === id ? { ...j, status: newStatus } : j));
        toast.success(`Job marked as ${newStatus}!`);
      }
    } catch (err) { 
      toast.error("Failed to update status");
      console.error(err); 
    }
  };

  const updateSOSStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/sos/${id}/status`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSosAlerts(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        toast.success(`SOS status updated to ${newStatus}!`, {
          style: { background: '#10b981', color: '#0f172a', fontWeight: '900' }
        });
      }
    } catch (err) { console.error(err); }
  };

  const activeSOS = sosAlerts.filter(a => a.status !== 'Resolved');

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between bg-[#1e293b] p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center font-black text-2xl text-[#10b981] border border-[#10b981]/30">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{user?.name || 'Technician'}</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{user?.specialization || 'General Mechanic'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors flex items-center gap-2 border border-red-500/20">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* ── SOS EMERGENCY ALERTS ─────────────────────────── */}
        {activeSOS.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span className="text-red-400 uppercase tracking-widest">Emergency SOS Alerts</span>
              <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </h2>

            {activeSOS.map(alert => (
              <div key={alert._id} className="bg-[#1e293b] rounded-3xl border-2 border-red-500/30 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <div className={`px-6 py-2 ${alert.urgency === 'Critical' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                  <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                    alert.urgency === 'Critical' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    <AlertTriangle className="w-4 h-4" /> {alert.urgency} Emergency
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-base text-white shrink-0">
                      {alert.customer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-white truncate">{alert.customer}</h3>
                      <p className={`text-sm font-bold text-slate-400 ${MONO}`}>{alert.phone}</p>
                    </div>
                    <a href={`tel:${alert.phone.replace(/\s/g, '')}`}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vehicle</p>
                      <p className="text-base font-black text-white">{alert.vehicle}</p>
                      <p className={`text-sm font-black text-blue-400 ${MONO}`}>{alert.plate}</p>
                    </div>
                    <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Issue</p>
                      <p className={`text-sm font-black ${alert.urgency === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        <Zap className="w-4 h-4 inline mr-1" />{alert.issue}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</p>
                      <p className="text-sm font-bold text-slate-300">{alert.location}</p>
                    </div>
                    <a href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-colors flex items-center gap-1.5 shrink-0">
                      <Navigation className="w-4 h-4" /> Navigate
                    </a>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {alert.status === 'Dispatched' && (
                      <button onClick={() => updateSOSStatus(alert._id, 'On-Site')}
                        className="flex-1 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-black text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        <MapPin className="w-5 h-5" /> I've Arrived On-Site
                      </button>
                    )}
                    {(alert.status === 'Dispatched' || alert.status === 'On-Site') && (
                      <button onClick={() => updateSOSStatus(alert._id, 'Resolved')}
                        className="flex-1 py-4 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Issue Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REGULAR JOBS ────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-400" /> Assigned Jobs
          </h2>
          <div className="space-y-6">
            {jobs.length === 0 && activeSOS.length === 0 ? (
              <div className="text-center p-12 bg-[#1e293b] rounded-3xl border-2 border-dashed border-white/5 text-slate-500 font-bold uppercase tracking-widest text-sm">
                {loading ? 'Fetching assigned workload...' : 'No jobs or emergencies assigned.'}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center p-8 bg-[#1e293b] rounded-3xl border border-white/5 text-slate-500 text-sm font-black uppercase tracking-widest">
                No regular jobs assigned.
              </div>
            ) : (
              jobs.map(job => (
                <div key={job._id} className="bg-[#1e293b] p-8 rounded-3xl border border-white/5 flex flex-col gap-8 transition-all hover:border-white/10 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-lg font-black text-blue-400 ${MONO}`}>#{job._id.slice(-6).toUpperCase()}</span>
                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{job.vehicle}</h3>
                      <p className={`text-base font-bold text-slate-400 ${MONO} mt-1`}>{job.plate}</p>
                    </div>

                    <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5 shrink-0 flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1 px-4 border-r border-white/10">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service</span>
                        <span className="text-xs font-black text-white">{job.type}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 px-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</span>
                        <span className={`text-xs font-black ${job.priority === 'High' ? 'text-red-400' : 'text-blue-400'}`}>{job.priority}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Progression UI */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Update Workshop Status</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateJobStatus(job._id, status)}
                          disabled={job.status === status}
                          className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            job.status === status 
                              ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                              : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {job.notes?.length > 0 && (
                    <div className="bg-[#0f172a] rounded-2xl p-5 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Latest Note
                      </p>
                      <p className="text-sm font-bold text-slate-300 italic">"{job.notes[job.notes.length - 1]}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
