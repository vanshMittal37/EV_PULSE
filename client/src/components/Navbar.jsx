import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Zap, Menu, Bell } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-emerald-500" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              EV Pulse
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "text-emerald-400 font-medium" : "text-gray-300 hover:text-white transition-colors"}>Dashboard</NavLink>
            <NavLink to="/stations" className={({isActive}) => isActive ? "text-emerald-400 font-medium" : "text-gray-300 hover:text-white transition-colors"}>Charging Stations</NavLink>
            <NavLink to="/services" className={({isActive}) => isActive ? "text-emerald-400 font-medium" : "text-gray-300 hover:text-white transition-colors"}>Service Hubs</NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/login" className="hidden md:block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors cursor-pointer text-center">
              Sign In
            </Link>
            <button className="md:hidden p-2 text-gray-400 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
