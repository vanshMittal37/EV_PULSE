import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import LogoutConfirmModal from '../LogoutConfirmModal';
import { AuthContext } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout } = React.useContext(AuthContext);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Role Protection
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || user.role !== 'SUPER_ADMIN') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSidebarOpen(false)}></div>
        <div className={`absolute inset-y-0 left-0 w-80 bg-[#0f172a] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onItemClick={() => setSidebarOpen(false)} />
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
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          onLogoutClick={() => setShowLogoutConfirm(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 w-full overflow-y-auto custom-scrollbar">
           <Outlet context={{ setSidebarOpen, searchQuery, setSearchQuery }} />
        </main>
      </div>

      <LogoutConfirmModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
};

export default AdminLayout;

