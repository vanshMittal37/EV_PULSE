import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Clock, Trophy, Plus, MapPin, 
  ChevronRight, Wrench, Search, QrCode, X, Play, LogOut, CheckCircle, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import toast, { Toaster } from 'react-hot-toast';

// ─── Tokens & Data ────────────────────────────────────────────────────────────
const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";

const ServiceTechnicians = () => {
  const [techs, setTechs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [draggedTech, setDraggedTech] = useState(null);
  const [techForm, setTechForm] = useState({
    name: '', email: '', password: '', contactNumber: '', specialization: 'General Mechanic', techLevel: 'Junior'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Techs
      const tRes = await fetch(`${API}/auth/technicians`, { headers: authHeaders() });
      const tData = await tRes.json();
      
      // Fetch Jobs
      const jRes = await fetch(`${API}/jobs`, { headers: authHeaders() });
      const jData = await jRes.json();

      if (tData.success && jData.success) {
        setJobs(jData.data);
        
        // Map techs with real-time job data
        const mappedTechs = tData.data.map(t => {
          const activeJob = jData.data.find(j => 
            j.technicianId?._id === t._id && 
            !['Completed', 'Ready for Delivery'].includes(j.status)
          );
          
          const completedJobs = jData.data.filter(j => 
            j.technicianId?._id === t._id && j.status === 'Completed'
          ).length;

          return {
            id: t._id,
            name: t.name,
            role: t.specialization || 'General Technician',
            avatar: t.name ? t.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?',
            level: t.techLevel || 'Junior',
            status: activeJob ? 'In-Bay' : 'Available',
            currentTask: activeJob ? activeJob.type : null,
            plate: activeJob ? activeJob.plate : null,
            bay: activeJob ? (activeJob.bay || 'Workshop') : null,
            jobsCompleted: completedJobs,
            activeJobId: activeJob?._id
          };
        });
        setTechs(mappedTechs);
      }
    } catch (err) {
      toast.error('Error fetching workshop data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTechs = techs.filter(t => 
    (t.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.role || '').toLowerCase().includes(search.toLowerCase())
  );

  // KPIs
  const busyCount = techs.filter(t => t.status === 'In-Bay').length;
  const availableCount = techs.filter(t => t.status === 'Available').length;
  const topPerformer = [...techs].sort((a, b) => b.jobsCompleted - a.jobsCompleted)[0];

  // Pending Jobs (Ready to be assigned or redirected)
  const pendingJobs = jobs.filter(j => !j.technicianId && j.status !== 'Completed');

  // Assignment Log (Last 5 completed jobs)
  const assignmentLog = jobs
    .filter(j => j.status === 'Completed')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(j => ({
      id: j._id,
      tech: j.technicianId?.name || 'Unknown',
      task: j.type,
      end: new Date(j.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(j.updatedAt).toLocaleDateString()
    }));

  const handleDrop = async (jobId) => {
    if (!draggedTech) return;
    try {
      const res = await fetch(`${API}/jobs/${jobId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ technicianId: draggedTech.id })
      });
      if (res.ok) {
        toast.success(`${draggedTech.name} assigned!`);
        fetchData();
      }
    } catch (err) { toast.error("Assignment failed"); }
    setDraggedTech(null);
  };


  // Helper inside component or outside
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In-Bay': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      case 'On Break': return 'bg-slate-700/50 text-slate-400 border-slate-600';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const [assigningTech, setAssigningTech] = useState(null);

  return (
    <div className="relative min-h-full pb-24">
      <Toaster position="top-center" />
      
      <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* Quick Assign Modal */}
        <AnimatePresence>
          {assigningTech && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssigningTech(null)} className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-[#1e293b] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-black text-white mb-2">Assign Job to {assigningTech.name}</h3>
                <p className="text-sm font-bold text-slate-500 mb-6">Select a pending job from the workshop floor.</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {pendingJobs.map(job => (
                    <button key={job._id} onClick={async () => {
                      try {
                        const res = await fetch(`${API}/jobs/${job._id}`, {
                          method: 'PUT', headers: authHeaders(), body: JSON.stringify({ technicianId: assigningTech.id })
                        });
                        if (res.ok) {
                          toast.success(`Assigned to ${assigningTech.name}`);
                          setAssigningTech(null);
                          fetchData();
                        }
                      } catch(e) { toast.error("Assignment failed"); }
                    }} className="w-full text-left p-4 bg-[#0f172a] hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-black text-blue-400 ${MONO}`}>#{job._id.slice(-4).toUpperCase()}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-base font-black text-white">{job.vehicle}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{job.type}</p>
                    </button>
                  ))}
                  {pendingJobs.length === 0 && <p className="text-center py-10 text-slate-500 font-bold italic">No pending jobs available.</p>}
                </div>
                <button onClick={() => setAssigningTech(null)} className="w-full mt-6 py-4 bg-white/5 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10">Close</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Header ──────────────────────────────────────────────────────── */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              <Users className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" /> Technician Hub
            </h1>
            <p className="text-sm md:text-base font-bold text-slate-500 mt-2">Manage workforce, track live workload, and monitor efficiency.</p>
          </div>
          <button 
            onClick={() => setShowOnboardModal(true)}
            className="w-full md:w-auto px-8 py-4 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" /> Onboard Service Boy
          </button>
        </div>


        {/* ── Workforce KPIs (Top Row) ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1e293b] border border-[#1e293b] p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-black/10">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Boys on Shift</p>
              <p className={`text-4xl font-black text-white tracking-tighter ${MONO}`}>{techs.length}</p>
            </div>
          </div>
          <div className="bg-[#1e293b] border border-[#1e293b] p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-black/10">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Activity className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Current Workload</p>
              <p className={`text-2xl font-black text-white tracking-tighter ${MONO}`}>{busyCount} <span className="text-sm font-bold text-slate-400">Busy</span> • {availableCount} <span className="text-sm font-bold text-slate-400">Avail</span></p>
            </div>
          </div>
          <div className="bg-[#1e293b] border border-[#1e293b] p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-black/10">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Active Jobs</p>
              <p className={`text-4xl font-black text-white tracking-tighter ${MONO}`}>{jobs.filter(j => !['Completed', 'Ready for Delivery'].includes(j.status)).length}</p>
            </div>
          </div>
          <div className="bg-[#1e293b] border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 relative z-10">
              <Trophy className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-black text-emerald-500/80 uppercase tracking-widest mb-1">Top Performer</p>
              <p className="text-2xl font-black text-white tracking-tighter">{topPerformer?.name || '—'}</p>
              <p className="text-xs font-bold text-emerald-400">{topPerformer?.jobsCompleted || 0} Jobs Completed</p>
            </div>
          </div>
        </div>

        {/* ── Main Workspace ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Live Roster Grid */}
          <div className="xl:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                <Wrench className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /> Live Staff Roster
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" placeholder="Search..." 
                  value={search} onChange={e => setSearch(e.target.value)}
                  className={`w-full bg-[#1e293b] border border-white/5 rounded-xl pl-12 pr-6 py-3 text-sm md:text-base font-bold text-white focus:outline-none focus:border-blue-500/50 ${MONO}`}
                />
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTechs.length > 0 ? (
                  filteredTechs.map(tech => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      key={tech.id}
                      draggable
                      onDragStart={() => setDraggedTech(tech)}
                      className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between cursor-grab active:cursor-grabbing"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-lg text-white">
                              {tech.avatar}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-white">{tech.name}</h3>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tech.role}</p>
                            </div>
                          </div>
                        </div>

                        {/* Status section */}
                        <div className="mb-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getStatusStyles(tech.status)}`}>
                            {tech.status === 'In-Bay' && <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                            {tech.status === 'Available' && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                            {tech.status === 'On Break' && <div className="w-2 h-2 rounded-full bg-slate-400" />}
                            {tech.status}
                          </div>
                        </div>

                        {/* Current Task Details */}
                        {tech.status === 'In-Bay' ? (
                          <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5 space-y-3 mb-6">
                            <div>
                              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Current Task</p>
                              <p className="text-base font-black text-white truncate">{tech.currentTask}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                              <span className={`text-sm font-black text-blue-400 ${MONO}`}>{tech.plate}</span>
                              <span className="flex items-center gap-1.5 text-xs font-black text-slate-300 uppercase tracking-widest">
                                <MapPin className="w-4 h-4 text-slate-500" /> {tech.bay}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#0f172a] rounded-xl p-4 border border-dashed border-white/5 flex items-center justify-center h-[116px] mb-6">
                            <p className="text-sm font-bold text-slate-500 text-center">
                              {tech.status === 'Available' ? 'Ready for assignment.' : 'Currently unavailable.'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {tech.status === 'In-Bay' ? (
                          <button className="flex-1 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl font-black text-sm uppercase tracking-widest transition-colors">
                            View Job
                          </button>
                        ) : (
                          <button 
                            onClick={() => setAssigningTech(tech)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
                          >
                            Assign Job
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))

                ) : (
                  <div className="col-span-full py-20 bg-[#1e293b]/50 border-2 border-dashed border-white/5 rounded-3xl text-center">
                    <p className="text-lg font-bold text-slate-500">
                      {loading ? 'Fetching staff members...' : search ? 'No technicians match your search.' : 'No technicians onboarded yet.'}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pending Jobs & Drag-Drop Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#1e293b] rounded-3xl p-6 border border-white/5">
              <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-amber-400" /> Pending Jobs
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-6">Drag a technician from the roster onto a job card to assign them instantly.</p>
              
              <div className="space-y-4">
                {pendingJobs.map(job => (
                  <div 
                    key={job._id} 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(job._id)}
                    className="bg-[#0f172a] p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-lg font-black text-blue-400 ${MONO}`}>#{job._id.slice(-4).toUpperCase()}</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting</span>
                    </div>
                    <p className="text-base font-black text-white">{job.vehicle}</p>
                    <p className={`text-sm font-bold text-slate-500 mt-1 ${MONO}`}>{job.plate}</p>
                    <p className="text-sm font-bold text-amber-400/80 mt-3 border-t border-white/5 pt-3">{job.type}</p>
                  </div>
                ))}
                {pendingJobs.length === 0 && (
                  <p className="text-center py-8 text-xs font-bold text-slate-500 italic">No pending jobs.</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ── Assignment Log (Bottom Table) ────────────────────────────────── */}
        <div className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-slate-400" /> Recent completions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a]/50">
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Technician</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Job Type</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Completion Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assignmentLog.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-white">{log.tech}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-base font-bold text-slate-300">{log.task}</td>
                    <td className={`px-8 py-5 text-base font-bold text-slate-400 ${MONO}`}>{log.date}</td>
                    <td className={`px-8 py-5 text-base font-black text-emerald-400 ${MONO}`}>{log.end}</td>
                  </tr>
                ))}
                {assignmentLog.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-10 text-center text-slate-500 font-bold">No recent completions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Modal: Onboard New Staff ──────────────────────────────────────── */}
      <AnimatePresence>
        {showOnboardModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm"
              onClick={() => setShowOnboardModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#0f172a]/30">
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <User className="w-8 h-8 text-[#10b981]" /> Onboard Staff
                </h2>
                <button onClick={() => setShowOnboardModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                    <input type="text" value={techForm.name} onChange={e => setTechForm({...techForm, name: e.target.value})} placeholder="e.g. Ramesh Kumar" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                    <input type="text" value={techForm.contactNumber} onChange={e => setTechForm({...techForm, contactNumber: e.target.value})} placeholder="+91" className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none ${MONO}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                    <input type="email" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} placeholder="tech@evpulse.com" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Password</label>
                    <input type="password" value={techForm.password} onChange={e => setTechForm({...techForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Specialization Role</label>
                    <select value={techForm.specialization} onChange={e => setTechForm({...techForm, specialization: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none appearance-none">
                      <option>General Mechanic</option>
                      <option>Battery Expert</option>
                      <option>Diagnostic Lead</option>
                      <option>Suspension Expert</option>
                      <option>Detailing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tech Level</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 bg-[#0f172a] border rounded-xl cursor-pointer transition-colors ${techForm.techLevel === 'Junior' ? 'border-[#10b981]/50' : 'border-white/10 hover:border-white/20'}`}>
                        <input type="radio" name="level" checked={techForm.techLevel === 'Junior'} onChange={() => setTechForm({...techForm, techLevel: 'Junior'})} className="w-4 h-4 accent-[#10b981]" />
                        <span className="text-base font-black text-white">Junior</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-3 p-4 bg-[#0f172a] border rounded-xl cursor-pointer transition-colors ${techForm.techLevel === 'Senior' ? 'border-[#10b981]/50' : 'border-white/10 hover:border-white/20'}`}>
                        <input type="radio" name="level" checked={techForm.techLevel === 'Senior'} onChange={() => setTechForm({...techForm, techLevel: 'Senior'})} className="w-4 h-4 accent-[#10b981]" />
                        <span className="text-base font-black text-white">Senior</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center mb-4">
                    <QrCode className="w-16 h-16 text-[#0f172a]" />
                  </div>
                  <p className="text-base font-black text-white">Login QR Code</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">This will be generated automatically upon saving. The technician can scan this to log into the Service Boy App.</p>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-[#0f172a] flex justify-between items-center">
                <button 
                  onClick={() => setShowOnboardModal(false)}
                  className="px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/technician`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${sessionStorage.getItem('token')}` // assuming token is in sessionStorage
                        },
                        body: JSON.stringify(techForm)
                      });
                      const data = await res.json();
                      if(data.success) {
                        toast.success('Technician Onboarded Successfully!');
                        setShowOnboardModal(false);
                        setTechForm({name: '', email: '', password: '', contactNumber: '', specialization: 'General Mechanic', techLevel: 'Junior'});
                        // Reload data
                        fetchData(); 
                      } else {
                        toast.error(data.message || 'Failed to onboard technician');
                      }
                    } catch(err) {
                      toast.error('An error occurred');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-base uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceTechnicians;

