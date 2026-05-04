import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  Wrench, 
  AlertCircle, 
  CreditCard, 
  UserCog, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ pendingApprovals = 0, onItemClick }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Vendor Management', path: '/admin/vendors', badge: pendingApprovals },
    { icon: Zap, label: 'Station Network', path: '/admin/network' },
    { icon: Wrench, label: 'Service Centers', path: '/admin/services' },
    { icon: AlertCircle, label: 'Emergency SOS Hub', path: '/admin/sos', sos: true },
    { icon: CreditCard,  label: 'Global Payments',   path: '/admin/payments' },
    { icon: UserCog, label: 'User Management', path: '/admin/users' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
  ];

  return (
    <div className="w-80 h-full min-h-screen bg-[#0f172a] text-gray-400 flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Zap className="text-white w-6 h-6 fill-current" />
        </div>
        <span className="text-2xl font-black text-white tracking-tighter italic">EV CONNECT</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            onClick={() => onItemClick?.()}
            className={({ isActive }) => cn(
              "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative",
              isActive 
                ? item.sos ? "bg-red-500 text-white shadow-[0_10px_25px_rgba(239,68,68,0.4)]" : "bg-[#10b981] text-white shadow-[0_10px_25px_rgba(16,185,129,0.3)]" 
                : "text-white hover:bg-white/10"
            )}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-4">
                  <item.icon className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    isActive ? "text-white" : "text-white/70 group-hover:text-white",
                    item.sos && !isActive && "animate-pulse text-red-500 fill-red-500/20"
                  )} />
                  <span className="font-bold text-base tracking-tight">{item.label}</span>
                </div>
                
                {item.sos && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_#ef4444]"></span>
                  </span>
                )}
                
                {item.badge && (
                  <span className="bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full animate-bounce shadow-lg shadow-red-500/40">
                    {item.badge}
                  </span>
                )}
                
                {!item.badge && !item.sos && !isActive && (
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-6px] group-hover:translate-x-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile Mini */}
      <div className="p-6 border-t border-gray-800 m-6 rounded-[1.5rem] bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10b981] to-emerald-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20 border-2 border-white/10">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Super Admin</p>
            <p className="text-[11px] font-bold text-gray-500 truncate uppercase tracking-widest">Master Controller</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
