import React, { useState, useEffect } from 'react';
import {
  Wallet, IndianRupee, TrendingUp, Calendar, ArrowRight,
  Landmark, AlertCircle, CheckCircle, Activity, ShieldCheck, X,
  Loader2, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const AnimatedCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.floor(value);
    if (start === end) return;

    let totalMilSecDur = 1000;
    let incrementTime = 30;
    let step = Math.max(Math.ceil(end / (totalMilSecDur / incrementTime)), 1);

    let timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString('en-IN')}</>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className={`text-base font-black ${MONO}`} style={{ color: entry.color }}>
          {entry.name}: ₹ {entry.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

const VendorEarnings = () => {
  const [chartMode, setChartMode] = useState('gross');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = async () => {
    try {
      const [earnRes, payRes] = await Promise.all([
        axios.get(`${API}/dashboard/earnings`, { headers: authHeaders() }),
        axios.get(`${API}/payouts`, { headers: authHeaders() })
      ]);
      
      if (earnRes.data.success) setEarnings(earnRes.data.data);
      if (payRes.data.success) setPayouts(payRes.data.data);
    } catch (err) { 
      console.error(err);
      toast.error("Failed to sync financial data");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) return;
    if (withdrawAmount > earnings.walletBalance) {
      toast.error("Amount exceeds wallet balance!");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await axios.post(`${API}/payouts/withdraw`, { amount: parseFloat(withdrawAmount) }, { headers: authHeaders() });
      if (res.data.success) {
        toast.success(`Withdrawal request for ₹${withdrawAmount} submitted!`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchData();
      }
    } catch (err) {
      toast.error("Withdrawal request failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading || !earnings) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Securing Financial Link...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto min-h-full font-['Inter']">
      <Toaster position="top-right" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Wallet Balance */}
        <div className="bg-gradient-to-br from-[#10b981]/20 to-[#1e293b] border border-[#10b981]/30 rounded-3xl p-6 lg:p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#10b981]/20 blur-3xl rounded-full" />
          <div>
            <p className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Wallet className="w-5 h-5" /> Wallet Balance
            </p>
            <h2 className={`text-5xl font-black text-white tracking-tighter ${MONO} mt-2 flex items-center gap-2`}>
              <span className="text-emerald-500">₹</span> <AnimatedCounter value={earnings.walletBalance} />
            </h2>
          </div>
          <button onClick={() => setShowWithdrawModal(true)} className="mt-8 w-full bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] font-black text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
            Withdraw Funds <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#1e293b] border border-white/5 rounded-3xl p-6 flex-1 flex flex-col justify-center">
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> Lifetime Revenue</p>
            <h3 className={`text-4xl font-black text-white ${MONO}`}>₹ {earnings.lifetimeRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-xs font-bold text-slate-400 mt-2">Total money processed by this station</p>
          </div>
          <div className="bg-[#1e293b] border border-white/5 rounded-3xl p-6 flex-1 flex flex-col justify-center">
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-400" /> Scheduled Payout</p>
            <h3 className={`text-2xl font-black text-white ${MONO}`}>Automated</h3>
            <p className="text-xs font-bold text-slate-400 mt-2">Monthly transfers to registered bank</p>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-white/5 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-300" /> Fee Structure Transparency
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-xl border border-white/5">
              <span className="text-sm font-bold text-slate-400">Platform Commission</span>
              <span className={`text-lg font-black text-red-400 ${MONO}`}>10%</span>
            </div>
            <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-xl border border-white/5">
              <span className="text-sm font-bold text-slate-400">Payment Gateway Fee</span>
              <span className={`text-lg font-black text-orange-400 ${MONO}`}>2%</span>
            </div>
            <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              <span className="text-sm font-black text-white">Net Vendor Margin</span>
              <span className={`text-2xl font-black text-emerald-400 ${MONO}`}>88%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <section className="bg-[#1e293b] border border-white/5 rounded-3xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-black text-white">Weekly Earnings Breakdown</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">Visualize your gross revenue vs platform contributions.</p>
          </div>
          <div className="flex bg-[#0f172a] p-1.5 rounded-xl border border-white/5 shrink-0">
            <button onClick={() => setChartMode('gross')} className={`px-4 py-2 rounded-lg text-sm font-black uppercase transition-all ${chartMode === 'gross' ? 'bg-[#10b981] text-[#0f172a]' : 'text-slate-400 hover:text-white'}`}>Gross Revenue</button>
            <button onClick={() => setChartMode('commission')} className={`px-4 py-2 rounded-lg text-sm font-black uppercase transition-all ${chartMode === 'commission' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}>Commission Paid</button>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earnings.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }} />
              {chartMode === 'gross' ? (
                <Bar dataKey="gross" name="Gross Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              ) : (
                <Bar dataKey="commission" name="Commission (12%)" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Payout History Ledger */}
      <section className="bg-[#1e293b] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2"><Landmark className="w-5 h-5 text-slate-400" /> Payout Ledger</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">History of funds transferred to your bank account.</p>
          </div>
          <button onClick={fetchData} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all border border-white/5">
             <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#0f172a]/50 border-b border-white/5">
                {['Payout ID', 'Date', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-8 py-20 text-center text-slate-500 font-bold">No payouts processed yet.</td>
                </tr>
              ) : payouts.map((payout, i) => (
                <tr key={payout._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5"><span className={`text-base font-black text-white ${MONO}`}>{payout.payoutId}</span></td>
                  <td className="px-8 py-5"><span className={`text-base font-black text-slate-400 ${MONO}`}>{new Date(payout.createdAt).toLocaleDateString()}</span></td>
                  <td className="px-8 py-5"><span className={`text-lg font-black text-emerald-400 ${MONO}`}>₹ {payout.amount.toLocaleString('en-IN')}</span></td>
                  <td className="px-8 py-5">
                    {payout.status === 'Paid' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5" /> {payout.status}</span>}
                    {payout.status === 'Processing' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20"><Activity className="w-3.5 h-3.5 animate-spin" /> {payout.status}</span>}
                    {payout.status === 'Failed' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle className="w-3.5 h-3.5" /> {payout.status}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#0f172a]/30">
                <h3 className="text-xl font-black text-white flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-400" /> Withdraw Funds</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8">
                <div className="bg-[#0f172a] rounded-2xl p-4 mb-6 border border-white/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">Available Balance</span>
                  <span className={`text-xl font-black text-emerald-400 ${MONO}`}>₹ {earnings.walletBalance.toLocaleString('en-IN')}</span>
                </div>
                <form onSubmit={handleWithdraw}>
                  <label className="block text-sm font-black text-slate-300 uppercase tracking-widest mb-2">Withdrawal Amount</label>
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-500">₹</span>
                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className={`w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-3xl font-black text-white focus:outline-none focus:border-emerald-500/50 ${MONO}`} autoFocus />
                  </div>
                  <button type="submit" disabled={withdrawing} className="w-full bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70">
                    {withdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Withdrawal <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorEarnings;
