import React, { useState, useEffect } from 'react';
import {
  Search, Plus, ClipboardList, Clock, AlertTriangle, User,
  CheckCircle, FileText, ChevronRight, X, PenTool, Battery,
  Wrench, FilePlus, Download, Printer, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import toast, { Toaster } from 'react-hot-toast';

// ─── Tokens & Data ────────────────────────────────────────────────────────────
const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const TABS = ['All Jobs', 'Diagnostic', 'In-Repair', 'Parts Pending', 'Quality Check', 'Ready for Delivery', 'Completed'];


// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPriorityColor = (priority) => {
  if (priority === 'High') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (priority === 'Medium') return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
  return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Diagnostic': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'In-Repair': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Parts Pending': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
    case 'Quality Check': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'Ready for Delivery': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Completed': return 'bg-emerald-500 text-[#0f172a] border-emerald-500';
    default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
  }
};

const formatId = (id) => `JC-${id.substring(id.length - 4).toUpperCase()}`;

// ─── Main Component ───────────────────────────────────────────────────────────
const ServiceJobCards = () => {
  const [activeTab, setActiveTab] = useState('All Jobs');
  const [search, setSearch] = useState('');
  
  // States
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    customer: '', phone: '', vehicle: '', plate: '',
    type: 'Periodic Maintenance', priority: 'Medium',
    technicianId: '', notes: '', batterySoc: '', damage: 'None (Clean)'
  });

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/jobs`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (err) { toast.error("Failed to load jobs"); }
    finally { setLoading(false); }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API}/auth/technicians`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setTechnicians(data.data);
    } catch (err) { console.error(err); }
  };


  useEffect(() => {
    fetchJobs();
    fetchTechnicians();
  }, []);

  // Computed
  const filteredJobs = jobs.filter(job => {
    const matchesTab = activeTab === 'All Jobs' 
      ? job.status !== 'Completed' 
      : job.status === activeTab;
      
    const matchesSearch = 
      formatId(job._id).toLowerCase().includes(search.toLowerCase()) || 
      job.plate.toLowerCase().includes(search.toLowerCase()) ||
      job.customer.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });


  const handleCreateJob = async () => {
    try {
      const res = await fetch(`${API}/jobs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...formData,
          notes: formData.notes ? [formData.notes] : []
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Job Card Generated!');
        setShowCreateModal(false);
        setFormData({
          customer: '', phone: '', vehicle: '', plate: '',
          type: 'Periodic Maintenance', priority: 'Medium',
          technicianId: '', notes: '', batterySoc: '', damage: 'None (Clean)'
        });
        fetchJobs();
      } else {
        toast.error(data.message || "Failed to create job");
      }
    } catch (err) { toast.error("Connection error"); }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/jobs/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Job marked as ${newStatus}`);
        fetchJobs();
        if (selectedJob?._id === id) setSelectedJob(data.data);
      }
    } catch (err) { toast.error("Update failed"); }
  };



  if (loading) return <div className="p-20 text-center text-slate-500 font-bold">Initializing Workshop Data...</div>;

  return (
    <div className="relative min-h-full pb-24">
      <Toaster position="top-center" />
      
      <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              <ClipboardList className="w-8 h-8 md:w-10 md:h-10 text-blue-400" /> Job Cards
            </h1>
            <p className="text-sm md:text-base font-bold text-slate-500 mt-2">Manage active vehicle repairs and workshop flow.</p>
          </div>
          <button 
            onClick={() => { setCreateStep(1); setShowCreateModal(true); }}
            className="w-full md:w-auto px-6 py-4 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Job Card
          </button>
        </div>


        {/* Filters & Search */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between bg-[#1e293b] p-4 rounded-2xl border border-white/5">
          <div className="flex overflow-x-auto gap-2 pb-2 xl:pb-0 custom-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeTab === tab 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-transparent text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full xl:w-96 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" placeholder="Search ID, Plate..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className={`w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-6 py-3.5 text-base font-bold text-white focus:outline-none focus:border-blue-500/50 ${MONO}`}
            />
          </div>

        </div>

        {/* Job Card List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map(job => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className={`bg-[#1e293b] rounded-3xl p-6 cursor-pointer hover:scale-[1.02] transition-all border-2 flex flex-col justify-between border-white/5 hover:border-blue-500/30 shadow-lg`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    <span className={`text-xl font-black text-white ${MONO}`}>{formatId(job._id)}</span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-white truncate">{job.vehicle}</h3>
                    <p className={`text-base font-black text-blue-400 mt-1 ${MONO}`}>{job.plate}</p>
                    <p className="text-base font-bold text-slate-400 mt-1">{job.customer}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-base text-white shrink-0">
                      {job.technicianId?.name?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black text-white truncate">{job.technicianId?.name || 'Unassigned'}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">{job.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest border ${getPriorityColor(job.priority)}`}>
                      {job.priority} Priority
                    </span>
                    <span className={`flex items-center gap-1.5 text-sm font-black uppercase tracking-widest text-slate-400`}>
                      <Clock className="w-5 h-5" /> {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-lg font-black text-white">No job cards found.</p>
            <p className="text-sm font-bold text-slate-500 mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* ── Slide-over: Job Card Detail ───────────────────────────────────── */}
      <AnimatePresence>
        {selectedJob && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0f172a]/80 backdrop-blur-sm"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-[#1e293b] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#0f172a]/30">
                <div>
                  <h2 className={`text-3xl font-black text-white tracking-tighter ${MONO}`}>{formatId(selectedJob._id)}</h2>
                  <span className={`inline-block mt-3 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                
                {/* Vehicle & Customer Data */}
                <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/5 space-y-5">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                    <User className="w-5 h-5" /> Customer Details
                  </h3>
                  <div>
                    <p className="text-xl font-black text-white">{selectedJob.customer}</p>
                    <p className={`text-base font-bold text-slate-400 ${MONO}`}>{selectedJob.phone}</p>
                  </div>
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3 pt-3">
                    <Wrench className="w-5 h-5" /> Vehicle Data
                  </h3>
                  <div>
                    <p className="text-xl font-black text-white">{selectedJob.vehicle}</p>
                    <p className={`text-base font-black text-blue-400 ${MONO}`}>{selectedJob.plate}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedJob.type}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-white/5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Update Priority</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map(p => (
                        <button
                          key={p}
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API}/jobs/${selectedJob._id}`, {
                                method: 'PUT',
                                headers: authHeaders(),
                                body: JSON.stringify({ priority: p })
                              });
                              const data = await res.json();
                              if (data.success) {
                                toast.success(`Priority set to ${p}`);
                                fetchJobs();
                                setSelectedJob(data.data);
                              }
                            } catch (err) { toast.error("Failed to update priority"); }
                          }}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                            selectedJob.priority === p 
                              ? (p === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/40' : p === 'Medium' ? 'bg-amber-400/20 text-amber-400 border-amber-400/40' : 'bg-blue-500/20 text-blue-400 border-blue-500/40')
                              : 'bg-transparent text-slate-500 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>


                {/* Technician & Notes */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                    <PenTool className="w-5 h-5" /> Technician Notes
                  </h3>
                  <div className="flex items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-white/5 w-max">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-sm text-white">
                      {selectedJob.technicianId?.name?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <span className="text-base font-black text-white">{selectedJob.technicianId?.name || 'Unassigned'}</span>
                  </div>
                  <ul className="space-y-3">
                    {selectedJob.notes?.map((note, i) => (
                      <li key={i} className="bg-[#0f172a] border border-white/5 p-4 rounded-xl text-base font-bold text-slate-300">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Live Estimator (Real values if any) */}
                <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/5 space-y-5">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                    <FileText className="w-5 h-5" /> Billing Information
                  </h3>
                  <div className="space-y-3">
                    {selectedJob.parts?.map((part, i) => (
                      <div key={i} className="flex justify-between text-base font-bold">
                        <span className="text-slate-300">{part.name}</span>
                        <span className={`text-white ${MONO}`}>₹{part.cost}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-base font-bold text-slate-400">
                      <span>Labor Charges</span>
                      <span className={MONO}>₹{selectedJob.laborCost || 0}</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-base font-black text-white uppercase tracking-widest">Current Total</span>
                    <span className={`text-3xl font-black text-emerald-400 ${MONO}`}>
                      ₹{(selectedJob.parts?.reduce((a, b) => a + b.cost, 0) || 0) + (selectedJob.laborCost || 0)}
                    </span>
                  </div>
                </div>

              </div>
              
              {/* Actions Footer */}
              <div className="p-8 border-t border-white/5 bg-[#0f172a] space-y-4">
                {selectedJob.status !== 'Ready for Delivery' && selectedJob.status !== 'Completed' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedJob._id, 'Ready for Delivery')}
                    className="w-full py-5 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-base uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-6 h-6" /> Mark Ready for Delivery
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modal: Create New Job Card ────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full sm:max-w-2xl bg-[#1e293b] border border-white/10 rounded-3xl sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#0f172a]/30">
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <FilePlus className="w-8 h-8 text-[#10b981]" /> Onboard Vehicle
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Stepper Header */}
              <div className="flex p-8 border-b border-white/5 bg-[#0f172a]/50">
                {['Vehicle Info', 'Problem', 'Inspection', 'Assign'].map((step, idx) => (
                  <div key={step} className="flex-1 flex flex-col items-center gap-3 relative">
                    {idx !== 3 && <div className="absolute top-4 left-1/2 w-full h-1 bg-slate-700 -z-10" />}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black z-10 ${createStep > idx ? 'bg-[#10b981] text-[#0f172a]' : createStep === idx + 1 ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500 border border-slate-600'}`}>
                      {idx + 1}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest text-center ${createStep === idx + 1 ? 'text-white' : 'text-slate-500'}`}>{step}</span>
                  </div>
                ))}
              </div>

              {/* Form Content */}
              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                {createStep === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <h3 className="text-xl font-black text-white">Customer & Vehicle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Customer Name</label>
                        <input type="text" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none ${MONO}`} />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">License Plate</label>
                        <input type="text" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none ${MONO}`} />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vehicle Model</label>
                        <input type="text" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none`} />
                      </div>
                    </div>

                  </div>
                )}
                
                {createStep === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <h3 className="text-xl font-black text-white">Problem Description</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Service Type</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none appearance-none">
                          <option>Periodic Maintenance</option>
                          <option>Battery Diagnostic</option>
                          <option>Software Flash</option>
                          <option>Accident Repair</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Priority Level</label>
                        <div className="flex gap-2">
                          {['Low', 'Medium', 'High'].map(p => (
                            <button
                              key={p}
                              onClick={() => setFormData({...formData, priority: p})}
                              className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                                formData.priority === p 
                                  ? (p === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/40' : p === 'Medium' ? 'bg-amber-400/20 text-amber-400 border-amber-400/40' : 'bg-blue-500/20 text-blue-400 border-blue-500/40')
                                  : 'bg-[#0f172a] text-slate-500 border-white/5 hover:border-white/10'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Initial Notes / Complaints</label>
                      <textarea rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-blue-500/50 focus:outline-none resize-none"></textarea>
                    </div>

                  </div>
                )}

                {createStep === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <h3 className="text-xl font-black text-white">Preliminary Inspection</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/10">
                        <Battery className="w-8 h-8 text-emerald-400 mb-3" />
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Battery SOC Check-in</label>
                        <input type="number" value={formData.batterySoc} onChange={e => setFormData({...formData, batterySoc: e.target.value})} placeholder="%" className={`w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-base font-bold text-white ${MONO}`} />
                      </div>
                      <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/10">
                        <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Visible Body Damage</label>
                        <select value={formData.damage} onChange={e => setFormData({...formData, damage: e.target.value})} className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-base font-bold text-white">
                          <option>None (Clean)</option>
                          <option>Minor Scratches</option>
                          <option>Dents present</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {createStep === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <h3 className="text-xl font-black text-white">Assign Technician</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {technicians.length > 0 ? technicians.map(tech => (
                        <label key={tech._id} className={`flex items-center gap-5 p-5 bg-[#0f172a] border rounded-2xl cursor-pointer hover:border-[#10b981]/50 transition-colors ${formData.technicianId === tech._id ? 'border-[#10b981]' : 'border-white/10'}`}>
                          <input type="radio" name="tech" checked={formData.technicianId === tech._id} onChange={() => setFormData({...formData, technicianId: tech._id})} className="w-5 h-5 accent-[#10b981]" />
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-black text-sm text-white">
                            {tech.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                             <p className="text-lg font-black text-white">{tech.name}</p>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tech.techLevel} • {tech.specialization}</p>
                          </div>
                        </label>
                      )) : (
                        <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/10">
                          <p className="text-red-400 font-bold">No technicians found. Please add technicians in the settings first.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/5 bg-[#0f172a] flex justify-between items-center">
                <button 
                  onClick={() => createStep > 1 ? setCreateStep(s => s - 1) : setShowCreateModal(false)}
                  className="px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  {createStep > 1 ? 'Back' : 'Cancel'}
                </button>
                <button 
                  onClick={() => {
                    if (createStep < 4) setCreateStep(s => s + 1);
                    else handleCreateJob();
                  }}
                  className="px-10 py-4 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-base uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {createStep < 4 ? 'Next Step' : 'Generate Job Card'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceJobCards;

