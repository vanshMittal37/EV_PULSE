import React, { useState, useEffect } from 'react';
import {
  Wrench, Zap, Clock, IndianRupee, TrendingUp, Car, Battery,
  Users, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
  Activity, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const anim = (d) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d } });

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const HybridDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/dashboard/stats`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const int = setInterval(fetchStats, 30000);
    return () => clearInterval(int);
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading dashboard data...</div>;
  }

  const { kpis, chartData, activeBays, ports, recentActivity } = stats;

  const getActivityConfig = (type) => {
    switch(type) {
      case 'repair': return { icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'charge': return { icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'sos': return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' };
      default: return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto min-h-full">
      {/* Header */}
      <motion.div {...anim(0)}>
        <h1 className="text-4xl font-black text-white tracking-tighter">Hybrid Dashboard</h1>
        <p className="text-base font-bold text-slate-500 mt-1">Service Center + Charging Station — unified view.</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Orders', value: kpis.activeJobs, sub: 'Service bays in use', icon: Wrench, color: 'blue', trend: 'Live', up: true },
          { label: 'Charging Sessions', value: kpis.activeSessions, sub: 'Ports active now', icon: Zap, color: 'emerald', trend: 'Live', up: true },
          { label: 'Avg Repair Time', value: kpis.avgRepairTime, sub: 'Per vehicle', icon: Clock, color: 'amber', trend: 'Lifetime', up: false },
          { label: 'Today Revenue', value: `₹${(kpis.revenueToday).toLocaleString('en-IN')}`, sub: 'Service + Charging', icon: IndianRupee, color: 'purple', trend: 'Today', up: true },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} {...anim(0.05 + i * 0.05)}
            className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 w-28 h-28 bg-${kpi.color}-500/5 rounded-full -translate-y-1/2 translate-x-1/2`} />
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 text-${kpi.color}-400`} />
              </div>
              <span className={`text-xs font-black flex items-center gap-1 ${kpi.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                {kpi.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.trend}
              </span>
            </div>
            <p className={`text-3xl font-black text-white tracking-tight ${MONO}`}>{kpi.value}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div {...anim(0.25)} className="xl:col-span-2 bg-[#1e293b] rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Weekly Revenue
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-1">Service (Blue) + Charging (Green)</p>
            </div>
            <p className={`text-2xl font-black text-white ${MONO}`}>
              ₹{(chartData.reduce((acc, d) => acc + d.service + d.charging, 0)).toLocaleString('en-IN')}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="srvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontWeight: 700 }} />
              <Area type="monotone" dataKey="service" stroke="#3b82f6" fill="url(#srvGrad)" strokeWidth={2.5} name="Service" />
              <Area type="monotone" dataKey="charging" stroke="#10b981" fill="url(#chgGrad)" strokeWidth={2.5} name="Charging" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Feed */}
        <motion.div {...anim(0.3)} className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 flex flex-col">
          <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 mb-5 border-b border-white/5 pb-4">
            <Activity className="w-5 h-5 text-amber-400" /> Live Activity
          </h2>
          <div className="flex-1 space-y-1 overflow-y-auto max-h-[280px] custom-scrollbar">
            {recentActivity && recentActivity.length > 0 ? recentActivity.map((a, i) => {
              const cfg = getActivityConfig(a.type);
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-300 leading-snug">{a.text}</p>
                    <p className="text-[10px] font-bold text-slate-600 mt-1">{timeAgo(a.time)}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 font-bold text-xs uppercase tracking-widest">
                No recent activity
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Service Bays + Charging Ports */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Service Bays */}
        <motion.div {...anim(0.35)} className="bg-[#1e293b] rounded-3xl p-6 border border-white/5">
          <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 mb-5 border-b border-white/5 pb-4">
            <Wrench className="w-5 h-5 text-blue-400" /> Service Bay Status
          </h2>
          <div className="space-y-3">
            {activeBays.length > 0 ? activeBays.map((job, idx) => (
              <div key={job._id} className="flex items-center gap-4 p-4 rounded-xl border bg-[#0f172a] border-white/5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20">{`B${idx+1}`}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-white truncate">{job.vehicle}</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-blue-500/10 text-blue-400">{job.status}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500">{job.plate} • {job.customer}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 font-bold bg-[#0f172a]/50 rounded-xl border border-dashed border-white/5">All Bays Available</div>
            )}
          </div>
        </motion.div>

        {/* Charging Ports */}
        <motion.div {...anim(0.4)} className="bg-[#1e293b] rounded-3xl p-6 border border-white/5">
          <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2 mb-5 border-b border-white/5 pb-4">
            <Zap className="w-5 h-5 text-emerald-400" /> Charging Port Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ports.length > 0 ? ports.map(port => (
              <div key={port._id} className={`p-5 rounded-2xl border transition-all ${port.status === 'Charging' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#0f172a] border-white/5'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-lg font-black ${MONO} ${port.status === 'Charging' ? 'text-emerald-400' : 'text-slate-500'}`}>{port.portId}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${port.status === 'Charging' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {port.status}
                  </span>
                </div>
                <p className={`text-sm font-black text-white ${MONO}`}>{port.power}</p>
                <p className="text-xs font-bold text-slate-500">{port.type}</p>
              </div>
            )) : (
              <div className="col-span-2 p-8 text-center text-slate-500 font-bold bg-[#0f172a]/50 rounded-xl border border-dashed border-white/5">No Ports Configured</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HybridDashboard;

