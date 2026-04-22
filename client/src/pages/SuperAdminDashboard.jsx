import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import StatCard from '../components/Dashboard/StatCard';
import NetworkMap from '../components/Dashboard/NetworkMap';
import UtilizationChart from '../components/Dashboard/UtilizationChart';
import ActivityTable from '../components/Dashboard/ActivityTable';
import { Menu, X, Users, Zap, AlertTriangle, DollarSign } from 'lucide-react';
import VendorPerformanceTable from '../components/Dashboard/VendorPerformanceTable';
import UserAcquisitionChart from '../components/Dashboard/UserAcquisitionChart';

const DUMMY_DATA = {
  stats: [
    { 
      title: 'Total Users (Globally)', 
      value: '28,451', 
      change: '+5%', 
      isIncrease: true, 
      data: [{val: 40}, {val: 45}, {val: 38}, {val: 52}, {val: 55}],
      bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      Icon: Users
    },
    { 
      title: 'Active Charging Stations', 
      value: '7,203', 
      change: '+3%', 
      isIncrease: true, 
      data: [{val: 60}, {val: 62}, {val: 65}, {val: 64}, {val: 68}],
      bgGradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      Icon: Zap
    },
    { 
      title: 'Pending Vendor Approvals', 
      value: '112', 
      change: 'High Priority!', 
      isIncrease: false, 
      data: [{val: 80}, {val: 90}, {val: 100}, {val: 105}, {val: 112}], 
      priority: true,
      bgGradient: 'bg-gradient-to-br from-orange-50 to-red-50',
      Icon: AlertTriangle
    },
    { 
      title: 'Global Revenue (Platform Fee)', 
      value: '$1,452,300', 
      change: '+8%', 
      isIncrease: true, 
      data: [{val: 100}, {val: 120}, {val: 115}, {val: 130}, {val: 145}],
      bgGradient: 'bg-gradient-to-br from-purple-50 to-fuchsia-50',
      Icon: DollarSign
    },
  ],
  utilization: [
    { name: 'Week 1', utilization: 45 },
    { name: 'Week 2', utilization: 52 },
    { name: 'Week 3', utilization: 48 },
    { name: 'Week 4', utilization: 61 },
    { name: 'Week 5', utilization: 55 },
    { name: 'Week 6', utilization: 67 },
    { name: 'Week 7', utilization: 72 },
  ],
  activity: [
    { time: '5 mins ago', action: 'Booking Confirmed', user: 'Rahul S.', status: 'Success' },
    { time: '12 mins ago', action: 'New Vendor Registered', user: 'PowerUp Delhi', status: 'Pending' },
    { time: '12 mins ago', action: 'New Vendor Registered', user: 'PowerUp Delhi', status: 'Pending' },
    { time: '5 mins ago', action: 'Charging Confirmed', user: 'Rahul S.', status: 'Success' },
    { time: '1 hour ago', action: 'System Update', user: 'AutoBot System', status: 'Success' },
  ]
};

const SuperAdminDashboard = () => {
  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Platform Overview</h1>
          <p className="text-gray-500 font-medium text-sm">Welcome back, Super Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            Download Reports
          </button>
          <button className="px-5 py-2.5 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            System Health: Good
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {DUMMY_DATA.stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <NetworkMap />
        <UtilizationChart data={DUMMY_DATA.utilization} />
      </div>

      {/* Bottom Row - Performance & Growth */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <VendorPerformanceTable />
        <UserAcquisitionChart />
      </div>

      {/* Bottom Table */}
      <ActivityTable data={DUMMY_DATA.activity} />
      
      {/* Footer-like status */}
      <div className="pt-8 pb-4 text-center">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
           © 2026 EV Connect Technologies • System v4.2.0 • Secured by PulseShield™
         </p>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
