import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Role Protection
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'SUPER_ADMIN') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0 sticky top-0 h-screen">
        <Sidebar pendingApprovals={12} />
      </div>

      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSidebarOpen(false)}></div>
        <div className={`absolute inset-y-0 left-0 w-80 bg-[#0f172a] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar pendingApprovals={12} />
          <button 
            onClick={() => setSidebarOpen(false)}
            className="absolute top-6 right-[-50px] p-2 bg-[#0f172a] text-white rounded-r-lg lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 w-full overflow-y-auto custom-scrollbar">
           {/* Mobile Menu Toggle (Overlay Trigger) */}
           <div className="lg:hidden p-4 flex items-center justify-between border-b border-gray-100 bg-white">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-slate-50 rounded-xl"
              >
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter italic">EV CONNECT</h1>
           </div>

           <Outlet context={{ setSidebarOpen }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
