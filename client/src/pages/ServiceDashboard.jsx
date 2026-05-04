import React, { useState, useEffect } from 'react';
import {
  Wrench, Activity, Clock, Users, AlertTriangle, Box,
  ChevronRight, CheckCircle, PenTool, Search, Plus, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const STATUS_STEPS = ['Diagnostic', 'In-Repair', 'Parts Pending', 'Quality Check', 'Ready for Delivery'];


const BayCard = ({ bay, idx }) => {
  const currentStep = STATUS_STEPS.indexOf(bay.status);
  const isEmpty = bay.status === 'Empty';

  return (
    <motion.div layout className={`bg-[#1e293b] rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${isEmpty ? 'border-white/5 opacity-60' : 'border-[#10b981]/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-white">Bay {String(idx + 1).padStart(2, '0')}</h3>
          {isEmpty ? <p className="text-sm font-black text-slate-500 uppercase tracking-widest mt-1">Empty Bay</p> : <p className={`text-base font-black text-blue-400 mt-1 ${MONO}`}>{bay.plate}</p>}
        </div>
      </div>

      {!isEmpty ? (
        <>
          <div className="flex items-center gap-4 bg-[#0f172a] rounded-2xl p-4 border border-white/5 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-base shrink-0 border border-blue-500/20">
              {bay.customer ? bay.customer.substring(0,2).toUpperCase() : 'C'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-base font-black text-white truncate">{bay.vehicle}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{bay.customer}</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-2.5 left-0 w-full h-0.5 bg-slate-700/50" />
            <div className="absolute top-2.5 left-0 h-0.5 bg-emerald-500 transition-all duration-500" style={{ width: `${(Math.max(0, currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }} />
            
            <div className="flex justify-between relative z-10">
              {STATUS_STEPS.map((step, stepIdx) => {
                const isCompleted = stepIdx < currentStep;
                const isCurrent = stepIdx === currentStep;
                return (
                  <div key={stepIdx} className="flex flex-col items-center group">
                    <div className="bg-[#1e293b] p-1 rounded-full">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-slate-700 border-2 border-[#1e293b]'}`}>
                        {isCompleted && <CheckCircle className="w-2.5 h-2.5 text-[#1e293b]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${currentStep === STATUS_STEPS.length - 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'}`}>
                {bay.status}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <Wrench className="w-10 h-10 text-slate-600 mb-4" />
          <p className="text-base font-bold text-slate-500">Bay is currently available.</p>
        </div>
      )}
    </motion.div>
  );
};

const ServiceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosAlerts, setSosAlerts] = useState([]);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/dashboard/stats`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) {
          // ensure 5 bays for UI
          let bays = [...data.data.activeBays];
          while (bays.length < 5) {
            bays.push({ status: 'Empty' });
          }
          data.data.activeBays = bays;
          setStats(data.data);
        }

        // Fetch Recent SOS
        const sRes = await fetch(`${API}/sos`, { headers: authHeaders() });
        const sData = await sRes.json();
        if (sData.success) {
          setSosAlerts(sData.data.slice(0, 3));
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchStats();
    const int = setInterval(fetchStats, 30000);
    return () => clearInterval(int);
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-lg font-black text-slate-500 uppercase tracking-widest">Synchronizing Dashboard...</p>
      </div>
    );
  }

  const { kpis, activeBays } = stats;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto min-h-full">
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e293b] border border-[#1e293b] p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-black/10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Active Bays</p>
            <p className={`text-4xl font-black text-white tracking-tighter ${MONO}`}>{kpis.activeJobs} <span className="text-lg text-slate-500">/ 5</span></p>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#1e293b] p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-black/10">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <ClipboardList className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Incoming Today</p>
            <p className={`text-4xl font-black text-white tracking-tighter ${MONO}`}>{kpis.activeJobs}</p>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#1e293b] p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-black/10">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Avg. Turnaround</p>
            <p className={`text-4xl font-black text-white tracking-tighter ${MONO}`}>{kpis.avgRepairTime.replace('h', '')} <span className="text-lg text-slate-500">hrs</span></p>
          </div>
        </div>
        <div className="bg-[#1e293b] border border-[#1e293b] p-6 rounded-3xl flex items-center gap-5 shadow-lg shadow-black/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Revenue Today</p>
            <p className={`text-4xl font-black text-white tracking-tighter ${MONO}`}>₹{(kpis.revenueToday/1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Floor Grid */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <PenTool className="w-8 h-8 text-blue-400" /> Live Workshop Floor
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBays.slice(0, 5).map((bay, idx) => (
              <BayCard key={idx} bay={bay} idx={idx} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
            <h3 className="text-base font-black text-red-400 uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
              <AlertTriangle className="w-6 h-6" /> Recent SOS Alerts
            </h3>
            <div className="space-y-4 relative z-10">
              {sosAlerts.length > 0 ? (
                sosAlerts.map(alert => (
                  <div key={alert._id} className="bg-[#0f172a] border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 animate-pulse shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-white uppercase tracking-widest">{alert.type || 'Emergency'}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{alert.description || 'Customer requires immediate assistance.'}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className={`text-[10px] font-black text-blue-400 ${MONO}`}>{alert.vehiclePlate || 'MH 02 BZ 9999'}</span>
                        <span className="text-[10px] font-bold text-slate-500">{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <CheckCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active alerts.</p>
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-3 border border-red-500/20 rounded-xl text-xs font-black text-red-400 uppercase tracking-widest hover:bg-red-500/10 transition-colors">View All Emergency Logs</button>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8">
            <h3 className="text-base font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <ClipboardList className="w-6 h-6" /> Workshop Summary
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">Total Completed Jobs</span>
                <span className={`text-lg font-black text-white ${MONO}`}>{(kpis.revenueToday / 2500).toFixed(0)}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '65%' }} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">Efficiency: 82% of target</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ServiceDashboard;

