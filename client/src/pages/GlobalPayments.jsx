import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, CreditCard, Clock, CheckCircle, Download, X,
  Search, Filter, ChevronDown, Send, IndianRupee, ArrowUpRight,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
const fmtCurrency = (n) => `₹${fmt(n)}`;

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const DAILY_REVENUE = Array.from({ length: 30 }, (_, i) => ({
  day: `Apr ${i + 1}`,
  revenue: Math.floor(280000 + Math.random() * 220000),
  fees: Math.floor(18000 + Math.random() * 14000),
}));

const DONUT_DATA = [
  { name: 'Charging Sessions', value: 58, color: '#10b981' },
  { name: 'Service Repairs',   value: 31, color: '#3b82f6' },
  { name: 'Subscriptions',     value: 11, color: '#f59e0b' },
];

const TRANSACTIONS = [
  { id: 'TXN-4821', date: '23 Apr, 09:14', vendor: 'Mishra EV Hub',     customer: 'Rohan Gupta',   amount: 1240,  fee: 74,  status: 'Completed', method: 'UPI'    },
  { id: 'TXN-4820', date: '23 Apr, 08:57', vendor: 'Apex Service Hub',  customer: 'Anita Verma',   amount: 3800,  fee: 228, status: 'Completed', method: 'Card'   },
  { id: 'TXN-4819', date: '23 Apr, 08:33', vendor: 'Sharma Charge Co.', customer: 'Suresh Mehta',  amount: 560,   fee: 34,  status: 'Processing', method: 'UPI'   },
  { id: 'TXN-4818', date: '23 Apr, 07:45', vendor: 'Nexa Repair',       customer: 'Priya Singh',   amount: 5200,  fee: 312, status: 'Completed', method: 'Wallet' },
  { id: 'TXN-4817', date: '23 Apr, 07:12', vendor: 'Volt Mechanics',    customer: 'Vikram Das',    amount: 2800,  fee: 168, status: 'Refunded',  method: 'Card'   },
  { id: 'TXN-4816', date: '22 Apr, 23:50', vendor: 'EcoDrive Charge',   customer: 'Amita Joshi',   amount: 890,   fee: 53,  status: 'Completed', method: 'UPI'    },
  { id: 'TXN-4815', date: '22 Apr, 22:17', vendor: 'GreenMile Hub',     customer: 'Karan Malhotra',amount: 1650,  fee: 99,  status: 'Completed', method: 'UPI'    },
  { id: 'TXN-4814', date: '22 Apr, 21:05', vendor: 'Mishra EV Hub',     customer: 'Sunita Rao',    amount: 730,   fee: 44,  status: 'Processing', method: 'Card'  },
  { id: 'TXN-4813', date: '22 Apr, 20:30', vendor: 'Apex Service Hub',  customer: 'Deepak Kumar',  amount: 4400,  fee: 264, status: 'Completed', method: 'Wallet' },
  { id: 'TXN-4812', date: '22 Apr, 19:55', vendor: 'Sharma Charge Co.', customer: 'Meera Pillai',  amount: 320,   fee: 19,  status: 'Refunded',  method: 'UPI'    },
];

const VENDORS_PAYOUT = [
  { id: 'V-001', name: 'Mishra EV Hub',     balance: 148200, bank: '••••3421', status: 'Ready'   },
  { id: 'V-002', name: 'Apex Service Hub',  balance: 312500, bank: '••••8812', status: 'Ready'   },
  { id: 'V-003', name: 'Sharma Charge Co.', balance: 78400,  bank: '••••6654', status: 'Pending' },
  { id: 'V-004', name: 'Nexa Repair',       balance: 225100, bank: '••••1190', status: 'Ready'   },
  { id: 'V-005', name: 'Volt Mechanics',    balance: 54900,  bank: '••••7723', status: 'Pending' },
  { id: 'V-006', name: 'EcoDrive Charge',   balance: 193750, bank: '••••4401', status: 'Ready'   },
];

// ─── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3"
  >
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3" />{trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tighter">{value}</p>
      {sub && <p className="text-[11px] font-bold text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    Processing: 'bg-blue-50 text-blue-700 border-blue-200',
    Refunded:   'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${map[status] || map.Completed}`}>
      {status}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xl">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-base font-black text-gray-900">{fmtCurrency(payload[0]?.value)}</p>
      <p className="text-xs font-bold text-emerald-600">Fee: {fmtCurrency(payload[1]?.value)}</p>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const GlobalPayments = () => {
  const [search, setSearch]             = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [showPayout, setShowPayout]     = useState(false);
  const [released, setReleased]         = useState([]);

  const filtered = TRANSACTIONS.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.id.toLowerCase().includes(q) || t.vendor.toLowerCase().includes(q);
    const matchMethod = methodFilter === 'All' || t.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const handleRelease = (id) => setReleased(prev => [...prev, id]);

  const handleDownload = () => {
    const rows = [
      ['Transaction ID', 'Date', 'Vendor', 'Customer', 'Amount', 'Fee', 'Status', 'Method'],
      ...TRANSACTIONS.map(t => [t.id, t.date, t.vendor, t.customer, t.amount, t.fee, t.status, t.method]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-['Inter']">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Finance Module</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Global Payments &amp; Revenue</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowPayout(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] rounded-xl text-sm font-black text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-4 h-4" /> Manage Payouts
          </button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard icon={TrendingUp}   label="Gross Platform Volume"   value="₹1,45,23,000" sub="Lifetime processed"           color="bg-emerald-500" trend="+12.4%" />
        <StatCard icon={IndianRupee}  label="Net Platform Fees"       value="₹8,71,380"    sub="~6% avg commission"           color="bg-blue-500"    trend="+8.1%"  />
        <StatCard icon={Clock}        label="Pending Vendor Payouts"  value="₹10,12,850"   sub="6 vendors awaiting release"   color="bg-amber-500"               />
        <StatCard icon={CheckCircle}  label="Successful Transactions" value="24,318"        sub="All time completed"           color="bg-violet-500"  trend="+5.3%" />
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────── */}
      <div className="flex gap-5 mb-8">
        {/* Area Chart */}
        <div className="flex-[6] bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last 30 Days</p>
              <h3 className="text-lg font-black text-gray-900 tracking-tighter">Daily Revenue</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>Fees</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DAILY_REVENUE} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="fees"    stroke="#3b82f6" strokeWidth={2}   fill="url(#feeGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="flex-[4] bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenue Mix</p>
          <h3 className="text-lg font-black text-gray-900 tracking-tighter mb-4">Earnings Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {DONUT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {DONUT_DATA.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }}></span>
                  <span className="text-xs font-bold text-gray-600">{d.name}</span>
                </div>
                <span className="text-xs font-black text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaction Ledger ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID or Vendor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              {['All', 'UPI', 'Card', 'Wallet'].map(m => <option key={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/70">
                {['Transaction ID', 'Date / Time', 'Vendor Name', 'Customer', 'Amount', 'Platform Fee', 'Method', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 text-sm font-black text-gray-900 font-mono">{t.id}</td>
                  <td className="px-5 py-4 text-xs font-bold text-gray-500">{t.date}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-800">{t.vendor}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-700">{t.customer}</td>
                  <td className="px-5 py-4 text-sm font-black text-gray-900">{fmtCurrency(t.amount)}</td>
                  <td className="px-5 py-4 text-sm font-black text-emerald-600">{fmtCurrency(t.fee)}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{t.method}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 font-bold text-sm">No transactions match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Payout Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPayout && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000]"
              onClick={() => setShowPayout(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] bg-white rounded-3xl shadow-2xl z-[1001] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/80">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Finance Operations</p>
                  <h2 className="text-xl font-black text-gray-900 tracking-tighter">Vendor Payout Management</h2>
                </div>
                <button onClick={() => setShowPayout(false)} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                {VENDORS_PAYOUT.map(v => {
                  const isReleased = released.includes(v.id);
                  return (
                    <div key={v.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isReleased ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isReleased ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{v.name}</p>
                          <p className="text-[11px] font-bold text-gray-400">Bank {v.bank} · {v.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance</p>
                          <p className="text-base font-black text-gray-900">{fmtCurrency(v.balance)}</p>
                        </div>
                        <button
                          onClick={() => handleRelease(v.id)}
                          disabled={isReleased}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            isReleased
                              ? 'bg-emerald-100 text-emerald-600 cursor-default'
                              : 'bg-[#10b981] text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20'
                          }`}
                        >
                          {isReleased ? (<><CheckCircle className="w-3.5 h-3.5" /> Sent</>) : (<><Send className="w-3.5 h-3.5" /> Release</>)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-100 bg-slate-50/80 text-center">
                <p className="text-xs font-bold text-gray-400">Payments are processed via NEFT/IMPS. Settlement occurs within 1–2 business days.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalPayments;
