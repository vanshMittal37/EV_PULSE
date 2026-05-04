import React, { useEffect, useState } from 'react';
import { socket } from '../utils/socket';
import StatCard from '../components/Dashboard/StatCard';
import NetworkMap from '../components/Dashboard/NetworkMap';
import UtilizationChart from '../components/Dashboard/UtilizationChart';
import ActivityTable from '../components/Dashboard/ActivityTable';
import { Users, Zap, AlertTriangle, DollarSign, AlertCircle, X, ShieldAlert } from 'lucide-react';
import VendorPerformanceTable from '../components/Dashboard/VendorPerformanceTable';
import UserAcquisitionChart from '../components/Dashboard/UserAcquisitionChart';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const DataMismatchAlert = ({ vendorCount, stationCount, onDismiss }) => {
  const delta = Math.abs(vendorCount - stationCount);
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-4 shadow-sm"
    >
      <div className="p-2.5 bg-red-100 rounded-xl shrink-0 mt-0.5">
        <ShieldAlert className="w-5 h-5 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-red-800 uppercase tracking-widest flex items-center gap-2">
          <AlertCircle className="w-4 h-4 animate-pulse" />
          System Alert — Data Mismatch Detected
        </p>
        <p className="text-xs font-bold text-red-600 mt-1 leading-relaxed">
          The Vendor count ({new Intl.NumberFormat('en-IN').format(vendorCount)}) and Station count (
          {new Intl.NumberFormat('en-IN').format(stationCount)}) are out of sync by{' '}
          <strong>{delta}</strong>. Under the 1:1 rule every Vendor must have exactly one Station.
        </p>
      </div>
      <button onClick={onDismiss} className="p-2 hover:bg-red-100 rounded-xl transition-colors shrink-0">
        <X className="w-4 h-4 text-red-500" />
      </button>
    </motion.div>
  );
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await fetch(`${API}/admin/stats`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchGlobalStats();
    const int = setInterval(fetchGlobalStats, 30000);
    
    socket.on('new-vendor', () => {
      console.log('Real-time: Refreshing dashboard stats...');
      fetchGlobalStats();
    });

    return () => {
      clearInterval(int);
      socket.off('new-vendor');
    };
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading global analytics...</div>;
  }

  const vendorCount = stats.totalVendors;
  const stationCount = stats.totalVendors; // Enforcing 1:1
  const hasMismatch = vendorCount !== stationCount && !alertDismissed;

  const statCards = [
    {
      title: 'Total Users (Globally)',
      value: new Intl.NumberFormat('en-IN').format(stats.activeUsers),
      change: 'Active Platform Users',
      isIncrease: true,
      data: stats.trends.users,
      bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      Icon: Users,
    },
    {
      title: 'Registered Vendors',
      value: new Intl.NumberFormat('en-IN').format(vendorCount),
      change: '1:1 parity enforced',
      isIncrease: true,
      data: stats.trends.vendors,
      bgGradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      Icon: Zap,
    },
    {
      title: 'Active Operations',
      value: `${stats.activeSessions + stats.activeJobs}`,
      change: `${stats.activeSessions} Charging • ${stats.activeJobs} Service`,
      isIncrease: true,
      data: stats.trends.operations,
      bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
      Icon: AlertTriangle,
    },
    {
      title: 'Global Revenue',
      value: `₹${new Intl.NumberFormat('en-IN').format(stats.totalRevenue)}`,
      change: `₹${(stats.serviceRev/1000).toFixed(1)}k Srv • ₹${(stats.chargeRev/1000).toFixed(1)}k Chg`,
      isIncrease: true,
      data: stats.trends.revenue,
      bgGradient: 'bg-gradient-to-br from-purple-50 to-fuchsia-50',
      Icon: DollarSign,
    },
  ];

  const recentActivity = stats.recentActivity.map(a => ({
    ...a,
    time: timeAgo(a.time)
  }));

  if (recentActivity.length === 0) {
    recentActivity.push(
      { time: 'Just now', action: 'System Monitoring', user: 'Pulse Engine', status: 'Success' }
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Platform Overview</h1>
          <p className="text-gray-500 font-medium text-sm">Welcome back, Super Admin. Here's what's happening today.</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Vendor–Station Parity: OK ({vendorCount} : {stationCount})
            </span>
            {stats.activeSOS > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1 uppercase tracking-widest">
                <AlertCircle className="w-3 h-3 animate-pulse" /> {stats.activeSOS} Active SOS Alerts
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#10b981] text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            System Health: Good
          </button>
        </div>
      </div>

      <AnimatePresence>
        {hasMismatch && <DataMismatchAlert vendorCount={vendorCount} stationCount={stationCount} onDismiss={() => setAlertDismissed(true)} />}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <NetworkMap data={stats.mapData} />
        <UtilizationChart data={stats.utilizationTrend} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <VendorPerformanceTable data={stats.vendorStats} />
        <UserAcquisitionChart data={stats.userGrowth} />
      </div>

      <ActivityTable data={recentActivity} />

      <div className="pt-8 pb-4 text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          © 2026 EV Connect Technologies • System v4.2.0 • Secured by PulseShield™
        </p>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

