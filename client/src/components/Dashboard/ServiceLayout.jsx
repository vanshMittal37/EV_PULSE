import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LogoutConfirmModal from '../LogoutConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ClipboardList, Users, Receipt, MessageSquare, AlertTriangle, 
  Settings, LogOut, Wrench, BatteryCharging, Menu, X
} from 'lucide-react';



const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/service/dashboard' },
  { icon: ClipboardList, label: 'Job Cards', path: '/service/jobs' },
  { icon: Users, label: 'Technician Hub', path: '/service/technicians' },
  { icon: Receipt, label: 'Billing', path: '/service/billing' },
  { icon: MessageSquare, label: 'Feedback', path: '/service/feedback' },
  { icon: AlertTriangle, label: 'SOS Alerts', path: '/service/sos' },
  { icon: Settings, label: 'Settings', path: '/service/settings' },
];

const ServiceLayout = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden relative">
      
      {/* ── Mobile Header ─────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b] border-b border-white/5 flex items-center justify-between px-6 z-[40]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-[#0f172a]" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter">EV Connect</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile Backdrop ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 w-[280px] bg-[#1e293b] border-r border-white/5 flex flex-col 
          transition-transform duration-300 z-[50] shrink-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Area */}
        <div className="h-24 hidden lg:flex items-center px-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wrench className="w-5 h-5 text-[#0f172a]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter">EV Connect</h1>
              <p className="text-xs font-black uppercase tracking-widest text-blue-400">Service Center</p>
            </div>
          </div>
        </div>

        {/* Mobile Brand Area (Optional redundancy) */}
        <div className="lg:hidden h-20 flex items-center px-8 border-b border-white/5">
           <h1 className="text-xl font-black text-white tracking-tighter">Menu</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                group flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all
                ${isActive 
                  ? 'bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] border border-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.label}
                  {item.label === 'SOS Alerts' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Sign Out Area */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-[#0f172a] rounded-xl p-2 border border-white/5">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#0f172a] pt-16 lg:pt-0">
        <Outlet />
      </main>


      <LogoutConfirmModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
};

export default ServiceLayout;
