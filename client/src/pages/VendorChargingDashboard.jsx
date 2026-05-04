import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Zap, BatteryCharging, Clock, IndianRupee, TrendingUp, Activity, AlertTriangle, Loader2, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;

const anim = (d) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d } });

const VendorChargingDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API}/dashboard/stats`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) { 
      console.error("Dashboard fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchStats();
    const int = setInterval(fetchStats, 30000); 
    return () => clearInterval(int);
  }, []);

  const handleStopCharge = async (sessionId, portName) => {
    if (!sessionId) return;
    setProcessingId(sessionId);
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.put(`${API}/charging/sessions/${sessionId}/stop`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success(`${portName} marked as Fully Charged`, {
          style: { borderRadius: '1rem', background: '#0f172a', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
        });
        fetchStats(); // Refresh data immediately
      }
    } catch (err) {
      console.error("Stop charge error:", err);
      toast.error("Failed to update charging status");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0f172a]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Live Hardware Data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center bg-[#0f172a] min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <p className="text-white font-black uppercase tracking-widest">Unable to link with charging grid.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold">Retry Connection</button>
      </div>
    );
  }

  const { kpis, chartData, ports } = stats;
  const activeKw = ports.filter(p => p.status === 'Charging').reduce((acc, p) => acc + (parseInt(p.power) || 22), 0);

  return (
    <div className="p-4 sm:p-10 space-y-10 max-w-[1700px] mx-auto min-h-full font-['Inter']">
      <Toaster position="bottom-right" />
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div {...anim(0)}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter">
                {user?.businessName || 'Your Station Dashboard'}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 flex items-center gap-2">
                Station Master: <span className="text-emerald-400">{user?.name}</span> <span className="w-1 h-1 rounded-full bg-slate-700"></span> Live Telemetry Control
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div {...anim(0.1)} className="bg-[#1e293b] px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-xl">
           <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Status</p>
              <p className="text-sm font-black text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM ONLINE
              </p>
           </div>
        </motion.div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Active Sessions', value: kpis.activeSessions, icon: BatteryCharging, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Power Consumption', value: `${activeKw} kW`, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Average Uptime', value: '99.9%', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Revenue (Today)', value: `₹${kpis.revenueToday.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((kpi, i) => (
          <motion.div key={i} {...anim(0.1 + i * 0.05)} className="bg-[#1e293b] rounded-[2rem] p-7 border border-white/5 relative group hover:border-emerald-500/30 transition-all shadow-xl">
            <div className={`w-14 h-14 rounded-2xl ${kpi.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
            </div>
            <p className={`text-4xl font-black text-white ${MONO} tracking-tighter mb-2`}>{kpi.value}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Analytics */}
        <motion.div {...anim(0.3)} className="xl:col-span-2 bg-[#1e293b] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-400" /> Performance Analytics</h2>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Revenue Flow (Last 7 Days)</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Period Gross</p>
               <p className={`text-3xl font-black text-white ${MONO}`}>
                ₹{(chartData.reduce((acc, d) => acc + d.charging, 0)).toLocaleString('en-IN')}
               </p>
            </div>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 800, color: '#fff' }} />
                <Area type="monotone" dataKey="charging" stroke="#10b981" fillOpacity={1} fill="url(#chgGrad)" strokeWidth={4} name="Daily Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Hardware Status */}
        <motion.div {...anim(0.4)} className="bg-[#1e293b] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-black text-white uppercase tracking-[0.15em] flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-400" /> Gun Status
            </h2>
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
              {ports.length} Total
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {ports.length > 0 ? ports.map((port, i) => (
              <div key={port._id} className="p-5 rounded-2xl border bg-[#0f172a] border-white/5 hover:border-emerald-500/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${port.status === 'Charging' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                       <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-lg font-black text-white ${MONO}`}>{port.portId || `Port ${i+1}`}</span>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{port.power} • {port.type}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
                    port.status === 'Charging' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' 
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {port.status}
                  </span>
                </div>
                
                {port.status === 'Charging' ? (
                  <div className="space-y-4 mt-4 pt-4 border-t border-white/5">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Current Session Delivery</span>
                        <span className="text-emerald-400">12.4 kWh</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                     </div>
                     
                     {/* ACTION BUTTON */}
                     <button 
                        onClick={() => handleStopCharge(port.currentSessionId, port.portId)}
                        disabled={processingId === port.currentSessionId}
                        className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 group/btn"
                     >
                        {processingId === port.currentSessionId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            Mark as Fully Charged
                          </>
                        )}
                     </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                       <Clock className="w-3 h-3" /> Waiting for vehicle connection...
                    </p>
                  </div>
                )}
              </div>
            )) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <AlertTriangle className="w-12 h-12 text-slate-800 mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Hardware Link Found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorChargingDashboard;
