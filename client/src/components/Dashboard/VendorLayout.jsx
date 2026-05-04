import React, { useState, useContext, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LogoutConfirmModal from '../LogoutConfirmModal';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Zap, Clock, IndianRupee, Store,
  Settings, LogOut, Menu, X, ChevronRight, Power, Loader2
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const NAV = [
  { to: '/vendor/charging-dashboard',  icon: LayoutDashboard, label: 'Dashboard'        },
  { to: '/vendor/ports',               icon: Zap,             label: 'Port Management'  },
  { to: '/vendor/sessions',            icon: Clock,           label: 'Session History'  },
  { to: '/vendor/earnings',            icon: IndianRupee,     label: 'Earnings & Payouts'},
  { to: '/vendor/profile',             icon: Store,           label: 'Station Profile'  },
  { to: '/vendor/settings',            icon: Settings,        label: 'Settings'         },
];

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const [maintenance, setMaintenance] = useState(user?.stationStatus === 'Maintenance');
  const [toggling, setToggling] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setMaintenance(user.stationStatus === 'Maintenance');
    }
  }, [user]);

  const handleToggleMaintenance = async () => {
    if (toggling) return;
    const targetStatus = !maintenance ? 'Maintenance' : 'Active';
    const portStatus = !maintenance ? 'Maintenance' : 'Available';
    
    setToggling(true);
    const toastId = toast.loading(`Switching to ${targetStatus} Mode...`);

    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Update the Station Status (User model)
      await axios.put(`${API}/auth/update-station-status`, { 
        stationStatus: targetStatus 
      }, { headers });

      // 2. Fetch all ports to update them too
      const portsRes = await axios.get(`${API}/charging/ports`, { headers });
      const ports = portsRes.data.data;

      // 3. Update all ports status
      await Promise.all(ports.map(p => 
        axios.put(`${API}/charging/ports/${p._id}/status`, { status: portStatus }, { headers })
      ));

      setMaintenance(!maintenance);
      toast.success(`Station is now ${targetStatus === 'Maintenance' ? 'in Maintenance' : 'Live'}`, { id: toastId });
      
      // Update local storage user object to reflect change
      const updatedUser = { ...user, stationStatus: targetStatus };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (err) {
      console.error("Maintenance toggle error:", err);
      toast.error('Failed to switch station mode', { id: toastId });
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden">
      <Toaster position="top-right" />

      {/* ── Mobile Header ─────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b] border-b border-white/5 flex items-center justify-between px-6 z-[40]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter italic">EV Pulse</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile Backdrop ───────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 bg-[#1e293b] border-r border-white/5 transition-all duration-300 z-[50] shrink-0
          ${sidebarOpen ? 'w-[260px] translate-x-0' : 'w-[72px] -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-[#10b981] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-black text-sm tracking-tight truncate">
                {user?.businessName || user?.name || 'EV Pulse Vendor'}
              </p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest truncate">
                Master: {user?.name}
              </p>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Vendor Portal</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="hidden lg:block ml-auto p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/vendor/charging-dashboard'}
              onClick={() => { if(window.innerWidth < 1024) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  isActive
                    ? 'bg-[#10b981]/15 text-emerald-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#10b981]" />
                  )}
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-[#10b981]' : ''}`} />
                  {sidebarOpen && (
                    <span className="text-sm font-bold truncate">{label}</span>
                  )}
                  {sidebarOpen && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400/50" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Maintenance Mode Toggle ────────────────────────────────────── */}
        <div className="px-3 pb-4 border-t border-white/5 pt-4 space-y-3">
          <div
            className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all cursor-pointer ${
              maintenance
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                : 'bg-white/5 border-white/5 text-slate-400'
            } ${toggling ? 'opacity-50 cursor-wait' : ''}`}
            onClick={handleToggleMaintenance}
          >
            {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className={`w-4 h-4 shrink-0 ${maintenance ? 'text-amber-400' : ''}`} />}
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest truncate">
                    Maintenance Mode
                  </p>
                  <p className={`text-[10px] font-bold ${maintenance ? 'text-amber-400' : 'text-slate-500'}`}>
                    {maintenance ? 'All Ports Paused' : 'Station Live'}
                  </p>
                </div>
                <div
                  className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                    maintenance ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      maintenance ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#0f172a] pt-16 lg:pt-0">
        {/* Maintenance banner */}
        {maintenance && (
          <div className="sticky top-0 z-[35] bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-center gap-3 backdrop-blur-sm">
            <Power className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest animate-pulse">
              Maintenance Mode Active — All ports are paused and hidden from users
            </p>
          </div>
        )}
        <Outlet context={{ maintenance }} />
      </main>

      <LogoutConfirmModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
};

export default VendorLayout;
