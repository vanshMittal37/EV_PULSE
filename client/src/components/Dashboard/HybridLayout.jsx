import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LogoutConfirmModal from '../LogoutConfirmModal';
import {
  LayoutDashboard, Zap, Clock, IndianRupee, MessageSquare,
  Wrench, ClipboardList, Users, AlertTriangle, Settings,
  LogOut, Menu, X, ChevronRight, Power, Receipt, BatteryCharging
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
  { heading: null, items: [
    { to: '/hybrid/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hybrid/earnings', icon: IndianRupee, label: 'Earnings & Payouts' },
    { to: '/hybrid/feedback', icon: MessageSquare, label: 'User Feedback' },
  ]},
  { heading: 'Service Operations', items: [
    { to: '/hybrid/service-bays', icon: Wrench, label: 'My Service Bays' },
    { to: '/hybrid/jobs', icon: ClipboardList, label: 'Job Cards' },
    { to: '/hybrid/technicians', icon: Users, label: 'Technician Hub' },
    { to: '/hybrid/billing', icon: Receipt, label: 'Billing & Invoice' },
    { to: '/hybrid/sos', icon: AlertTriangle, label: 'SOS Emergency', badge: true },
  ]},
  { heading: 'Charging Operations', items: [
    { to: '/hybrid/ports', icon: Zap, label: 'My Charging Ports' },
    { to: '/hybrid/sessions', icon: Clock, label: 'Session History' },
  ]},
  { heading: 'Settings', items: [
    { to: '/hybrid/settings', icon: Settings, label: 'Profile & Security' },
  ]},
];

const HybridLayout = () => {
  const [open, setOpen] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden">
      
      {/* ── Mobile Header ─────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b] border-b border-white/5 flex items-center justify-between px-6 z-[40]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10b981] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-4 h-4 text-[#0f172a]" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter italic">EV Pulse</h1>
        </div>
        <button 
          onClick={() => setOpen(!open)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile Backdrop ───────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 bg-[#1e293b] border-r border-white/5 transition-all duration-300 z-[50] shrink-0
        ${open ? 'w-[270px] translate-x-0' : 'w-[72px] -translate-x-full lg:translate-x-0'}
      `}>

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#f59e0b] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-[#0f172a]" />
          </div>
          {open && (
            <div className="overflow-hidden">
              <p className="text-white font-black text-sm tracking-tight truncate">EV CONNECT</p>
              <p className="text-[#10b981] text-[10px] font-black uppercase tracking-widest">Hybrid Portal</p>
            </div>
          )}
          <button onClick={() => setOpen(p => !p)} className="hidden lg:block ml-auto p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <button onClick={() => setOpen(false)} className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {SECTIONS.map((section, si) => (
            <div key={si}>
              {section.heading && open && (
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 pt-5 pb-2">{section.heading}</p>
              )}
              {!section.heading ? null : !open && <div className="border-t border-white/5 my-2" />}
              {section.items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink key={to} to={to}
                  onClick={() => { if(window.innerWidth < 1024) setOpen(false); }}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                    isActive ? 'bg-[#10b981]/15 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}>
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#10b981]" />}
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#10b981]' : ''}`} />
                      {open && <span className="text-sm font-bold truncate">{label}</span>}
                      {open && badge && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                      {open && isActive && !badge && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400/50" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-white/5 pt-4 space-y-3">
          {/* Maintenance Toggle */}
          <div className={`flex items-center gap-3 px-3 py-3 rounded-xl border cursor-pointer transition-all ${
            maintenance ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/5 text-slate-400'
          }`} onClick={() => setMaintenance(p => !p)}>
            <Power className={`w-4 h-4 shrink-0 ${maintenance ? 'text-amber-400' : ''}`} />
            {open && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest truncate">Maintenance</p>
                  <p className={`text-[10px] font-bold ${maintenance ? 'text-amber-400' : 'text-slate-500'}`}>
                    {maintenance ? 'All Paused' : 'Systems Live'}
                  </p>
                </div>
                <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${maintenance ? 'bg-amber-500' : 'bg-slate-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${maintenance ? 'translate-x-4' : ''}`} />
                </div>
              </>
            )}
          </div>

          <button onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut className="w-4 h-4 shrink-0" />
            {open && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#0f172a] custom-scrollbar pt-16 lg:pt-0">
        {maintenance && (
          <div className="sticky top-0 z-[35] bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-center gap-3">
            <Power className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Maintenance Mode — All ports paused, workshop still accepting walk-ins
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

export default HybridLayout;
