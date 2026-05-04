import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Download, Send, Printer, Receipt, Car, User,
  Clock, Wrench, Hash, ChevronDown, CheckCircle, IndianRupee,
  Zap, Shield, Calendar, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token')}`
});

const EV_MODELS = [
  { name: 'Tata Tiago.ev', baseFee: 2500 },
  { name: 'Tata Nexon EV', baseFee: 3500 },
  { name: 'Nexon EV MAX', baseFee: 4000 },
  { name: 'MG ZS EV', baseFee: 4500 },
  { name: 'Hyundai Kona', baseFee: 5000 },
  { name: 'Hyundai Ioniq 5', baseFee: 6500 },
  { name: 'Kia EV6', baseFee: 7000 },
  { name: 'BYD Atto 3', baseFee: 5500 },
  { name: 'BMW iX1', baseFee: 8500 },
  { name: 'Mercedes EQS', baseFee: 12000 },
];

const SERVICE_TYPES = [
  'Periodic Maintenance', 'Battery Diagnostic', 'Software Flash',
  'Accident Repair', 'Suspension Repair', 'AC Service', 'Brake Service'
];

const GST_RATE = 0.18;

const ServiceBilling = () => {
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedModel, setSelectedModel] = useState(EV_MODELS[0]);
  const [plateNumber, setPlateNumber] = useState('');
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [technicianName, setTechnicianName] = useState('');
  
  const [laborHours, setLaborHours] = useState(2);
  const [laborRate, setLaborRate] = useState(500);
  const [discount, setDiscount] = useState(0);
  const [additionalParts, setAdditionalParts] = useState([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState('');
  
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState(null);

  const fetchData = async () => {
    try {
      // Fetch Jobs (only un-invoiced/completed jobs for billing)
      const jRes = await fetch(`${API}/jobs`, { headers: authHeaders() });
      const jData = await jRes.json();
      if (jData.success) {
        setJobs(jData.data.filter(j => j.status === 'Ready for Delivery'));

      }

      // Fetch Invoices
      const iRes = await fetch(`${API}/service/invoices`, { headers: authHeaders() });
      const iData = await iRes.json();
      if (iData.success) {
        setInvoices(iData.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-fill form when a job is selected
  useEffect(() => {
    if (selectedJob) {
      setCustomerName(selectedJob.customer || '');
      setCustomerPhone(selectedJob.phone || '');
      const model = EV_MODELS.find(m => m.name === selectedJob.vehicle) || EV_MODELS[0];
      setSelectedModel(model);
      setPlateNumber(selectedJob.plate || '');
      setServiceType(selectedJob.type || SERVICE_TYPES[0]);
      setTechnicianName(selectedJob.technicianId?.name || '');
      setAdditionalParts(selectedJob.parts || []);
      setInvoiceGenerated(false);
      setGeneratedInvoiceId(null);
    }
  }, [selectedJob]);

  // Calculations
  const baseFee = selectedModel.baseFee;
  const laborCharges = laborHours * laborRate;
  const partsTotal = additionalParts.reduce((sum, p) => sum + p.cost, 0);
  const subtotal = baseFee + laborCharges + partsTotal;
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = Math.round(taxableAmount * GST_RATE);
  const grandTotal = taxableAmount + gstAmount;

  const addPart = () => {
    if (!newPartName || !newPartCost) return;
    setAdditionalParts([...additionalParts, { name: newPartName, cost: Number(newPartCost) }]);
    setNewPartName(''); setNewPartCost('');
  };

  const removePart = (idx) => setAdditionalParts(additionalParts.filter((_, i) => i !== idx));

  const handleGenerateInvoice = async () => {
    if (!customerName.trim()) return toast.error('Customer name required');
    if (!selectedJob) return toast.error('Please select a Job Card first to bill');

    try {
      const payload = {
        jobId: selectedJob._id,
        customer: customerName,
        vehicle: selectedModel.name,
        baseFee,
        laborCharges,
        partsTotal,
        tax: gstAmount,
        total: grandTotal,
        status: 'Pending'
      };

      const res = await fetch(`${API}/service/invoices`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setInvoiceGenerated(true);
        setGeneratedInvoiceId(data.data._id);
        // Update Job Status to Completed
        await fetch(`${API}/jobs/${selectedJob._id}`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'Completed' })
        });
        
        toast.success('Invoice generated & Job Completed!', {
          style: { background: '#10b981', color: '#0f172a', fontWeight: '900' }
        });
        setSelectedJob(null); // Clear selection
        fetchData();

      }
    } catch (err) { toast.error('Failed to generate invoice'); }
  };

  const markPaid = async () => {
    if (!generatedInvoiceId) return;
    try {
      const res = await fetch(`${API}/service/invoices/${generatedInvoiceId}/status`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'Paid' })
      });
      if (res.ok) {
        // Reinforce Job Completion on payment
        if (selectedJob) {
          await fetch(`${API}/jobs/${selectedJob._id}`, {
            method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'Completed' })
          });
        }
        toast.success('Invoice marked as Paid!');
        fetchData();
      }
    } catch (err) { console.error(err); }
  };


  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto min-h-full">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Receipt className="w-10 h-10 text-emerald-400" /> Billing & Invoice
          </h1>
          <p className="text-base font-bold text-slate-500 mt-2">Select a completed job card to generate an invoice.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-[#1e293b] border border-white/10 rounded-xl text-sm font-bold text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* ── LEFT: Job Selection & Invoice Form ──────────────────────────────── */}
        <div className="xl:col-span-3 space-y-6">

          {/* Job Selection */}
          <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
              <Search className="w-5 h-5 text-emerald-400" /> Select Job to Bill
            </h2>
            {jobs.length === 0 ? (
              <p className="text-slate-500 font-bold text-sm">No completed jobs ready for billing.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobs.map(job => {
                  const isSelected = selectedJob?._id === job._id;
                  return (
                    <button key={job._id} onClick={() => setSelectedJob(job)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-[#0f172a] border-white/5 hover:border-white/20'
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-black ${isSelected ? 'text-emerald-400' : 'text-blue-400'} ${MONO}`}>#{job._id.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{job.status}</span>
                      </div>
                      <p className="text-base font-black text-white">{job.customer}</p>
                      <p className="text-xs font-bold text-slate-400">{job.vehicle} • {job.plate}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedJob && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                {/* Form Fields... */}
                <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Customer Name</label>
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Phone</label>
                      <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">EV Model</label>
                      <select value={selectedModel.name} onChange={e => setSelectedModel(EV_MODELS.find(m => m.name === e.target.value))}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:outline-none">
                        {EV_MODELS.map(m => <option key={m.name} value={m.name}>{m.name} — Base ₹{m.baseFee}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Service Type</label>
                      <select value={serviceType} onChange={e => setServiceType(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:outline-none">
                        {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Labor Hours</label>
                      <input type="number" min="0.5" step="0.5" value={laborHours} onChange={e => setLaborHours(Number(e.target.value))}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Rate / Hour (₹)</label>
                      <input type="number" min="100" step="50" value={laborRate} onChange={e => setLaborRate(Number(e.target.value))}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 space-y-6">
                  <h2 className="text-lg font-black text-white uppercase tracking-widest">Parts & Add-ons</h2>
                  {additionalParts.length > 0 && (
                    <div className="space-y-3">
                      {additionalParts.map((part, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#0f172a] rounded-xl px-5 py-4 border border-white/5">
                          <span className="text-base font-bold text-slate-300">{part.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-base font-black text-white">{formatCurrency(part.cost)}</span>
                            <button onClick={() => removePart(idx)} className="text-red-400 text-xs font-black uppercase tracking-widest">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4">
                    <input type="text" value={newPartName} onChange={e => setNewPartName(e.target.value)} placeholder="Part name" className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none" />
                    <input type="number" value={newPartCost} onChange={e => setNewPartCost(e.target.value)} placeholder="Cost ₹" className="w-36 bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none" />
                    <button onClick={addPart} className="px-6 py-4 bg-purple-500/10 text-purple-400 rounded-xl font-black text-sm uppercase">Add</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Live Invoice Preview ─────────────────────── */}
        <div className="xl:col-span-2">
          <div className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden sticky top-8">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 border-b border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-[#0f172a]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">EV Connect</h3>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Service Invoice</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black text-blue-400 ${MONO}`}>{selectedJob ? `#${selectedJob._id.slice(-6).toUpperCase()}` : '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f172a]/50 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-base font-black text-white truncate">{customerName || '—'}</p>
                </div>
                <div className="bg-[#0f172a]/50 rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vehicle</p>
                  <p className="text-base font-black text-white truncate">{selectedModel.name}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center py-3">
                <div><p className="text-base font-bold text-slate-300">Base Service Fee</p></div>
                <span className="text-base font-black text-white">{formatCurrency(baseFee)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-white/5">
                <div><p className="text-base font-bold text-slate-300">Labor Charges</p></div>
                <span className="text-base font-black text-white">{formatCurrency(laborCharges)}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-t-2 border-white/10">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-lg font-black text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-white/5">
                <div><p className="text-sm font-bold text-slate-400">GST (18%)</p></div>
                <span className="text-base font-black text-amber-400">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="bg-[#0f172a] rounded-2xl p-6 border-2 border-emerald-500/20 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Grand Total</p>
                  <span className="text-4xl font-black text-[#10b981]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-[#0f172a]/30 space-y-4">
              {!invoiceGenerated ? (
                <button onClick={handleGenerateInvoice} disabled={!selectedJob}
                  className="w-full py-5 bg-[#10b981] disabled:opacity-50 text-[#0f172a] rounded-xl font-black text-base uppercase tracking-widest transition-all">
                  Generate Invoice
                </button>
              ) : (
                <>
                  <div className="flex gap-4">
                    <button onClick={() => window.print()} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-black text-sm uppercase">Print</button>
                    <button onClick={markPaid} className="flex-1 py-4 bg-emerald-500/10 text-emerald-400 rounded-xl font-black text-sm uppercase">Mark Paid</button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-widest pt-2">
                    <CheckCircle className="w-5 h-5" /> Generated Successfully
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Previous Invoices Grid */}
      {invoices.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <Receipt className="w-6 h-6 text-slate-500" /> Recent Invoices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {invoices.map(inv => (
              <div key={inv._id} className="bg-[#1e293b] p-5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-xs font-black text-blue-400 ${MONO}`}>#{inv._id.slice(-6).toUpperCase()}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${inv.status==='Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{inv.status}</span>
                </div>
                <p className="text-lg font-black text-white">{inv.customer}</p>
                <p className="text-xs font-bold text-slate-500">{inv.vehicle}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                  <span className={`text-xl font-black text-[#10b981] ${MONO}`}>{formatCurrency(inv.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceBilling;

