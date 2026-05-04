import React, { useState, useEffect } from 'react';
import {
  Clock, Zap, IndianRupee, Search, Filter, Download,
  CheckCircle, ArrowRight, BatteryCharging, AlertCircle,
  Calendar, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const VendorSessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${API}/charging/sessions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filter Logic
  const filtered = sessions.filter(s =>
    s.user.toLowerCase().includes(search.toLowerCase()) ||
    s.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    (s.portId?.portId || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeSessions = sessions.filter(s => s.status === 'Active');
  const totalEnergy = sessions.reduce((acc, s) => acc + (s.energyConsumed || 0), 0);
  const totalRevenue = sessions.reduce((acc, s) => acc + (s.cost || 0), 0);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (start, end) => {
    if (!start) return '--';
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const diff = Math.floor((e - s) / 60000); // mins
    if (diff < 60) return `${diff}m`;
    return `${Math.floor(diff/60)}h ${diff%60}m`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Clock className="w-10 h-10 text-blue-400" /> Session History
          </h1>
          <p className="text-base font-bold text-slate-500 mt-2">View all active and completed charging sessions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchSessions} 
            disabled={isRefreshing}
            className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Sessions', value: activeSessions.length, icon: BatteryCharging, color: 'blue' },
          { label: 'Total Energy Dispensed', value: `${totalEnergy.toFixed(1)} kWh`, icon: Zap, color: 'emerald' },
          { label: 'Gross Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: IndianRupee, color: 'amber' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-[#1e293b] p-6 rounded-3xl border border-white/5 flex items-center gap-5 relative overflow-hidden group">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-7 h-7 text-${stat.color}-400`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-3xl font-black text-white tracking-tight ${MONO}`}>{stat.value}</p>
            </div>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${stat.color}-500/10 transition-colors`} />
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#1e293b] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Search by customer, vehicle, or port..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-colors" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#0f172a]/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID / Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer & Vehicle</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Port</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Energy / Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Cost / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-bold">Loading sessions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-bold">No sessions found. Add ports and start sessions.</td></tr>
              ) : (
                filtered.map(session => (
                  <tr key={session._id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    {/* ID / Date */}
                    <td className="px-6 py-4">
                      <p className={`text-sm font-black text-blue-400 ${MONO}`}>#{session._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> {formatDate(session.startTime)}</p>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-black text-white shrink-0">
                          {session.user.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{session.user}</p>
                          <p className="text-xs font-bold text-slate-400">{session.vehicle}</p>
                        </div>
                      </div>
                    </td>

                    {/* Port */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border bg-[#0f172a] border-white/10 text-xs font-black text-slate-300 ${MONO}`}>
                        {session.portId?.portId || 'Unknown'}
                      </span>
                    </td>

                    {/* Energy */}
                    <td className="px-6 py-4">
                      <p className={`text-sm font-black text-white ${MONO}`}>{session.energyConsumed?.toFixed(1) || 0} kWh</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">{getDuration(session.startTime, session.endTime)}</p>
                    </td>

                    {/* Cost / Status */}
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-black text-white ${MONO}`}>{session.status === 'Active' ? '--' : `₹${session.cost?.toFixed(0)}`}</p>
                      <div className="mt-1 flex justify-end">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                          session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorSessionHistory;
