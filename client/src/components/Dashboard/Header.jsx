import React, { useContext } from 'react';
import { Search, Bell, LogOut, ChevronDown, User, Menu } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutConfirmModal from '../LogoutConfirmModal';

const Header = ({ onMenuClick, onLogoutClick, searchQuery, setSearchQuery }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/80">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#10b981] transition-colors" />
          <input
            type="text"
            placeholder="Search for users, charging stations, or alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-[#10b981]/10 focus:border-[#10b981] focus:bg-white transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium tabular-nums shadow-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group">
          <Bell className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
          </span>
        </button>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 tabular-nums">superadmin@evconnect.com</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                <User className="w-6 h-6" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:rotate-180" />
            </button>
            
            {/* Simple Dropdown Menu (Hidden by default) */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={onLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
