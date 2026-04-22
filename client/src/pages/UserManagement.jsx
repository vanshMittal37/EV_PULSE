import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Zap, UserPlus, TicketCheck, Search, ChevronDown,
  Download, Eye, MessageSquare, Lock, Unlock, X,
  Phone, Mail, Car, Wallet, Calendar, MapPin, Clock,
  RefreshCw, Ban, ShieldOff, CheckCircle, AlertCircle,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN').format(n);
const fmtCurrency = (n) => `₹${fmt(n)}`;

const VEHICLES = ['Tata Nexon EV', 'MG ZS EV', 'Hyundai Kona', 'Kia EV6', 'Ola S1 Pro', 'Ather 450X'];
const REGIONS  = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai'];
const NAMES    = [
  ['Rohan', 'Gupta'], ['Anita', 'Verma'], ['Suresh', 'Mehta'], ['Priya', 'Singh'],
  ['Vikram', 'Das'],  ['Meera', 'Pillai'],['Arjun', 'Malhotra'],['Sunita', 'Rao'],
  ['Deepak', 'Kumar'],['Kavya', 'Nair'],  ['Sanjay', 'Sharma'],['Ritu', 'Agarwal'],
  ['Anil', 'Joshi'],  ['Pooja', 'Iyer'],  ['Rahul', 'Pandey'], ['Neha', 'Reddy'],
];

function seed(n) {
  const rng = (s) => { let x = Math.sin(s + 1) * 10000; return x - Math.floor(x); };
  return Array.from({ length: n }, (_, i) => {
    const [first, last] = NAMES[i % NAMES.length];
    const statuses = ['Active', 'Active', 'Active', 'Inactive', 'Banned'];
    const status   = statuses[i % statuses.length];
    const vehicle  = VEHICLES[i % VEHICLES.length];
    const region   = REGIONS[i % REGIONS.length];
    const joined   = new Date(2024, Math.floor(rng(i * 3) * 12), Math.floor(rng(i * 7) * 28) + 1)
      .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    return {
      id: `USR-${1000 + i}`,
      name: `${first} ${last}`,
      username: `@${first.toLowerCase()}${last.toLowerCase().slice(0, 3)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
      phone: `+91 ${9800000000 + i * 7}`,
      vehicle, region, status, joined,
      wallet: Math.floor(rng(i * 11) * 4000) + 200,
      avatar: `${first[0]}${last[0]}`,
      tickets: i % 7 === 0 ? Math.floor(rng(i) * 3) + 1 : 0,
      activity: [
        { type: 'Charging Session', location: `${region} - EV Hub`, time: '2 hrs ago',  kwh: `${(rng(i) * 30 + 10).toFixed(1)} kWh`, cost: fmtCurrency(Math.floor(rng(i * 2) * 500 + 100)) },
        { type: 'Service Visit',    location: `Apex Service Hub`,   time: '3 days ago', kwh: null, cost: fmtCurrency(Math.floor(rng(i * 3) * 2000 + 500)) },
        { type: 'Wallet Top-Up',    location: 'EV Connect App',     time: '5 days ago', kwh: null, cost: fmtCurrency(1000) },
        { type: 'Charging Session', location: `${region} - Station`, time: '1 week ago', kwh: `${(rng(i * 4) * 25 + 8).toFixed(1)} kWh`, cost: fmtCurrency(Math.floor(rng(i * 5) * 400 + 80)) },
        { type: 'Support Ticket',   location: 'EV Connect App',     time: '2 weeks ago', kwh: null, cost: null },
      ],
    };
  });
}

const MOCK_USERS = seed(16);

// ─── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, pulse }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} relative`}>
      <Icon className="w-5 h-5 text-white" />
      {pulse && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tighter">{value}</p>
      {sub && <p className="text-[11px] font-bold text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
    Banned:   'bg-red-50 text-red-600 border-red-200',
    Suspended:'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${map[status] || map.Inactive}`}>
      {status}
    </span>
  );
};

const ActivityIcon = ({ type }) => {
  if (type === 'Charging Session') return <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><Zap className="w-4 h-4 text-emerald-600" /></div>;
  if (type === 'Service Visit')    return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Car className="w-4 h-4 text-blue-600" /></div>;
  if (type === 'Wallet Top-Up')    return <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center"><Wallet className="w-4 h-4 text-violet-600" /></div>;
  return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><TicketCheck className="w-4 h-4 text-gray-500" /></div>;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers]               = useState(MOCK_USERS);
  const [search, setSearch]             = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  // ── Filtering ──
  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    const matchVehicle = vehicleFilter === 'All' || u.vehicle === vehicleFilter;
    const matchRegion  = regionFilter  === 'All' || u.region  === regionFilter;
    const matchStatus  = statusFilter  === 'All' || u.status  === statusFilter;
    return matchSearch && matchVehicle && matchRegion && matchStatus;
  }), [users, search, vehicleFilter, regionFilter, statusFilter]);

  const clearFilters = () => { setSearch(''); setVehicleFilter('All'); setRegionFilter('All'); setStatusFilter('All'); };

  // ── Toggle suspend ──
  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
      : u
    ));
    setSelectedUser(prev => prev?.id === id
      ? { ...prev, status: prev.status === 'Active' ? 'Suspended' : 'Active' }
      : prev
    );
  };

  // ── CSV Export ──
  const handleDownload = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Phone', 'Vehicle', 'Region', 'Status', 'Wallet', 'Joined'],
      ...users.map(u => [u.id, u.name, u.email, u.phone, u.vehicle, u.region, u.status, u.wallet, u.joined]),
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'users.csv'; a.click();
  };

  const totalActive  = users.filter(u => u.status === 'Active').length;
  const totalTickets = users.reduce((acc, u) => acc + u.tickets, 0);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-['Inter'] relative">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Driver Database</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">User Management</h1>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Download User Data
        </button>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users}       label="Total Registered Drivers" value={fmt(28451)}   sub="All time signups"       color="bg-emerald-500" />
        <StatCard icon={Zap}         label="Active Now"                value={fmt(1842)}    sub="Using the app live"     color="bg-blue-500"    pulse />
        <StatCard icon={UserPlus}    label="New Sign-ups Today"        value="+142"         sub="Since 12:00 AM"         color="bg-violet-500"  />
        <StatCard icon={TicketCheck} label="Open Support Tickets"      value={totalTickets} sub="Requires attention"     color="bg-amber-500"   />
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {[
          { label: 'Vehicle', options: ['All', ...VEHICLES], val: vehicleFilter, set: setVehicleFilter },
          { label: 'Region',  options: ['All', ...REGIONS],  val: regionFilter,  set: setRegionFilter  },
          { label: 'Status',  options: ['All', 'Active', 'Inactive', 'Banned', 'Suspended'], val: statusFilter, set: setStatusFilter },
        ].map(({ label, options, val, set }) => (
          <div key={label} className="relative">
            <select value={val} onChange={e => set(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              {options.map(o => <option key={o}>{o === 'All' ? `All ${label}s` : o}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/70">
                {['User Profile', 'Contact', 'EV Details', 'Region', 'Wallet', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                >
                  {/* Profile */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{user.name}</p>
                        <p className="text-[11px] font-bold text-gray-400">{user.username}</p>
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-gray-700">{user.email}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{user.phone}</p>
                  </td>
                  {/* Vehicle */}
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-black whitespace-nowrap">{user.vehicle}</span>
                  </td>
                  {/* Region */}
                  <td className="px-5 py-4 text-xs font-bold text-gray-600 whitespace-nowrap">{user.region}</td>
                  {/* Wallet */}
                  <td className="px-5 py-4 text-sm font-black text-gray-900">{fmtCurrency(user.wallet)}</td>
                  {/* Status */}
                  <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
                  {/* Joined */}
                  <td className="px-5 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">{user.joined}</td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedUser(user)} title="View Profile"
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      <button title="Message"
                        className="p-2 bg-slate-100 hover:bg-blue-100 rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                      </button>
                      <button onClick={() => toggleStatus(user.id)} title={user.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                        className={`p-2 rounded-lg transition-colors ${user.status === 'Active' ? 'bg-slate-100 hover:bg-red-100' : 'bg-amber-100 hover:bg-amber-200'}`}>
                        {user.status === 'Active'
                          ? <Lock className="w-4 h-4 text-slate-600 hover:text-red-600" />
                          : <Unlock className="w-4 h-4 text-amber-600" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-black text-base mb-1">No users found</p>
            <p className="text-gray-400 font-bold text-sm mb-5">Try adjusting your search or filters.</p>
            <button onClick={clearFilters}
              className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-black rounded-xl hover:bg-emerald-600 transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ── User Detail Slide-over ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[1000]"
              onClick={() => setSelectedUser(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 w-[440px] bg-white shadow-2xl z-[1001] flex flex-col border-l border-gray-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-md">
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">{selectedUser.name}</h2>
                    <p className="text-xs font-bold text-gray-400">{selectedUser.username} · {selectedUser.id}</p>
                    <div className="mt-1"><StatusBadge status={selectedUser.status} /></div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                {/* Personal Info */}
                <section>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Personal Info</p>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                    {[
                      { icon: Mail,    label: 'Email',   val: selectedUser.email   },
                      { icon: Phone,   label: 'Phone',   val: selectedUser.phone   },
                      { icon: Car,     label: 'Vehicle', val: selectedUser.vehicle },
                      { icon: MapPin,  label: 'Region',  val: selectedUser.region  },
                      { icon: Wallet,  label: 'Wallet',  val: fmtCurrency(selectedUser.wallet) },
                      { icon: Calendar,label: 'Joined',  val: selectedUser.joined  },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                          <p className="text-sm font-bold text-gray-800">{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recent Activity */}
                <section>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Activity</p>
                  <div className="space-y-3">
                    {selectedUser.activity.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-gray-100">
                        <ActivityIcon type={a.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900">{a.type}</p>
                          <p className="text-[11px] font-bold text-gray-400 truncate">{a.location}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {a.cost && <p className="text-sm font-black text-gray-900">{a.cost}</p>}
                          {a.kwh  && <p className="text-[10px] font-bold text-emerald-600">{a.kwh}</p>}
                          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-0.5 justify-end"><Clock className="w-3 h-3" />{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Account Controls */}
                <section>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Account Controls</p>
                  <div className="space-y-2.5">
                    <button className="w-full flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 border border-gray-100 rounded-xl transition-colors group">
                      <div className="p-2 bg-white rounded-lg border border-gray-100"><RefreshCw className="w-4 h-4 text-blue-500" /></div>
                      <div className="text-left">
                        <p className="text-sm font-black text-gray-800">Reset Password</p>
                        <p className="text-[11px] font-bold text-gray-400">Send reset link to user's email</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-emerald-50 border border-gray-100 rounded-xl transition-colors group">
                      <div className="p-2 bg-white rounded-lg border border-gray-100"><Wallet className="w-4 h-4 text-emerald-500" /></div>
                      <div className="text-left">
                        <p className="text-sm font-black text-gray-800">Refund Wallet</p>
                        <p className="text-[11px] font-bold text-gray-400">Credit balance back to user</p>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleStatus(selectedUser.id)}
                      className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-colors ${
                        selectedUser.status === 'Active'
                          ? 'bg-red-50 hover:bg-red-100 border-red-100'
                          : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100'
                      }`}>
                      <div className="p-2 bg-white rounded-lg border border-gray-100">
                        {selectedUser.status === 'Active'
                          ? <Ban className="w-4 h-4 text-red-500" />
                          : <CheckCircle className="w-4 h-4 text-emerald-500" />
                        }
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-black ${selectedUser.status === 'Active' ? 'text-red-700' : 'text-emerald-700'}`}>
                          {selectedUser.status === 'Active' ? 'Disable Account' : 'Re-enable Account'}
                        </p>
                        <p className="text-[11px] font-bold text-gray-400">
                          {selectedUser.status === 'Active' ? 'Suspend user from the platform' : 'Restore user access'}
                        </p>
                      </div>
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
