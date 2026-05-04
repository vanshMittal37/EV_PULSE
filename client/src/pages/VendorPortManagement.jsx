import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, Power, Activity, Thermometer, RefreshCw, StopCircle,
  AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp,
  Cpu, BatteryCharging, Radio, Wrench, Plus, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const STATUS_CFG = {
  Charging:  { border: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500 animate-pulse' },
  Available: { border: 'border-blue-500', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
  Offline:     { border: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]', badge: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-500 animate-ping' },
  Maintenance: { border: 'border-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-500' },
};

const PortCard = ({ port, onStop, onReboot, onStart, onToggleOffline }) => {
  const cfg = STATUS_CFG[port.status] || STATUS_CFG.Available;
  const isCharging = port.status === 'Charging';
  const isMaintenance = port.status === 'Maintenance';

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-[#1e293b] rounded-2xl p-6 flex flex-col gap-5 border-2 transition-all ${cfg.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white tracking-tighter">{port.portId}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{port.type} • {port.power}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${cfg.badge}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          {port.status}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isCharging ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-400"/> Output</p>
              <p className={`text-xl font-black text-white ${MONO}`}>{port.kw || 0} kW</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><BatteryCharging className="w-3 h-3 text-blue-400"/> Session</p>
              <p className={`text-xl font-black text-white ${MONO}`}>{port.soc || 0}%</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-[100px] flex flex-col items-center justify-center text-center bg-white/5 rounded-xl border border-white/5">
            {isMaintenance ? (
              <div className="flex flex-col items-center animate-pulse">
                <Wrench className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Maintenance Active</p>
              </div>
            ) : (
              <>
                <Radio className="w-6 h-6 text-slate-600 mb-2" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gun Ready</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 pt-2">
        {isCharging ? (
          <button onClick={() => onStop(port.currentSessionId, port.portId)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5">
            <StopCircle className="w-4 h-4" /> Stop
          </button>
        ) : (
          <button 
            onClick={() => onToggleOffline(port._id, isMaintenance ? 'Available' : 'Maintenance')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isMaintenance ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white'
            }`}>
            {isMaintenance ? <Zap className="w-4 h-4" /> : <Wrench className="w-4 h-4" />} {isMaintenance ? 'Go Live' : 'Service'}
          </button>
        )}
        <button onClick={() => onReboot(port._id)}
          className="px-4 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#0f172a] border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
        {!isCharging && !isMaintenance && (
          <button onClick={() => onStart(port._id)}
            className="px-4 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5">
            <Activity className="w-4 h-4" /> Test
          </button>
        )}
      </div>
    </motion.div>
  );
};

const VendorPortManagement = () => {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPort, setNewPort] = useState({ portId: '', type: 'CCS2', power: '50 kW' });

  const fetchPorts = async () => {
    try {
      const res = await axios.get(`${API}/charging/ports`, { headers: authHeaders() });
      if (res.data.success) {
        const withTelemetry = res.data.data.map(p => {
          if (p.status === 'Charging') {
            return { ...p, kw: Math.floor(Math.random() * 30) + 15, soc: Math.floor(Math.random() * 60) + 20 };
          }
          return p;
        });
        setPorts(withTelemetry);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPorts();
    const int = setInterval(fetchPorts, 10000);
    return () => clearInterval(int);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API}/charging/ports/${id}/status`, { status }, { headers: authHeaders() });
      if (res.data.success) {
        toast.success(`Port ${status === 'Maintenance' ? 'Placed in Maintenance' : 'Activated'}`);
        fetchPorts();
      }
    } catch (err) { toast.error('Command failed'); }
  };

  const handleStart = async (portIdStr) => {
    try {
      const res = await axios.post(`${API}/charging/sessions/start`, { 
        portId: portIdStr, 
        user: 'Auto-Master', 
        vehicle: 'Test Unit-01' 
      }, { headers: authHeaders() });
      if (res.data.success) {
        toast.success('Hardware Test Session Started');
        fetchPorts();
      }
    } catch (err) { toast.error('Failed to start test session'); }
  };

  const handleStop = async (sessionId, portId) => {
    if (!sessionId) {
       handleUpdateStatus(portId, 'Available');
       return;
    }
    try {
      await axios.put(`${API}/charging/sessions/${sessionId}/stop`, {}, { headers: authHeaders() });
      toast.success('Session Terminated');
      fetchPorts();
    } catch (err) { toast.error('Failed to stop session'); }
  };

  const handleReboot = async (id) => {
    toast('Rebooting hardware controller...', { icon: '🔄' });
    await handleUpdateStatus(id, 'Available');
  };

  const handleAddPort = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/charging/ports`, newPort, { headers: authHeaders() });
      if (res.data.success) {
        toast.success('Port Registered');
        setShowAdd(false);
        fetchPorts();
      }
    } catch (err) { toast.error('Registration failed'); }
  };

  const currentKw = ports.reduce((sum, p) => sum + parseFloat(p.kw || 0), 0);
  const MAX_KW = ports.length * 50;

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1700px] mx-auto min-h-full font-['Inter']">
      <Toaster position="top-right" />
      
      {/* Refined Header */}
      <div className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Zap className="w-40 h-40 text-emerald-400" />
        </div>
        
        <div className="relative z-10 flex-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" /> Infrastructure Control Link
          </p>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            Station Hub Core
          </h1>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Grid Load</span>
                  <span className={`text-xl font-black text-white ${MONO}`}>{currentKw.toFixed(1)} kW</span>
                </div>
                <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(currentKw / (MAX_KW || 1)) * 100}%` }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacity Used</p>
                   <p className={`text-xl font-black text-white ${MONO}`}>{Math.round((currentKw / (MAX_KW || 1)) * 100)}%</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center justify-center gap-2 px-10 py-5 bg-emerald-500 text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" /> Register New Port
          </button>
        </div>
      </div>

      {/* Add Port Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddPort}
            className="bg-[#1e293b] p-8 rounded-[2rem] border-2 border-emerald-500/30 grid grid-cols-1 md:grid-cols-4 gap-6 items-end shadow-2xl">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Internal Port ID</label>
              <input required type="text" value={newPort.portId} onChange={e => setNewPort({...newPort, portId: e.target.value})} placeholder="e.g. CORE-P1" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Connector Protocol</label>
              <select value={newPort.type} onChange={e => setNewPort({...newPort, type: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none">
                <option>CCS2 (Fast)</option><option>Type 2 (AC)</option><option>CHAdeMO (DC)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Rated Power (Max)</label>
              <select value={newPort.power} onChange={e => setNewPort({...newPort, power: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none">
                <option>22 kW</option><option>50 kW</option><option>120 kW</option><option>150 kW</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                Add To Hub
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-4 bg-white/5 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Ports Registry */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Accessing Local Controller...</p>
        </div>
      ) : ports.length === 0 ? (
        <div className="py-32 text-center bg-[#1e293b]/50 rounded-[3rem] border-4 border-dashed border-white/5">
          <Cpu className="w-16 h-16 text-slate-700 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white tracking-tighter">Hardware Sync Pending</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Add your first charging gun to start telemetry</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {ports.map(port => (
            <PortCard 
              key={port._id} 
              port={port} 
              onStart={handleStart} 
              onStop={handleStop} 
              onReboot={handleReboot} 
              onToggleOffline={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorPortManagement;
