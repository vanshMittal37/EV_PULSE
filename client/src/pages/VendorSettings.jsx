import React, { useState, useEffect } from 'react';
import {
  User, Lock, ShieldCheck, Landmark, FileText, Bell, Smartphone,
  Activity, Globe, AlertTriangle, Power, X, Eye, EyeOff, Mail, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;

const Toggle = ({ checked, onChange }) => (
  <div 
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${checked ? 'bg-[#10b981]' : 'bg-slate-700'}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
  </div>
);

const VendorSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBankAuthModal, setShowBankAuthModal] = useState(false);
  
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    taxId: '',
    twoFactor: false,
    webhookUrl: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolder: ''
    }
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [bankAuthPass, setBankAuthPass] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  const fetchSettings = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await axios.get(`${API}/auth/me`, { headers: authHeaders() });
      if (res.data.success) {
        const u = res.data.data;
        setSettings({
          name: u.name || '',
          email: u.email || '',
          taxId: u.taxId || '',
          twoFactor: u.twoFactor || false,
          webhookUrl: u.webhookUrl || '',
          bankDetails: u.bankDetails || {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            accountHolder: ''
          }
        });
      }
    } catch (err) {
      console.error("Settings Load Error:", err);
      const msg = err.response?.data?.message || "Failed to load settings from server";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBankChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const tid = toast.loading("Updating configurations...");
    try {
      const res = await axios.put(`${API}/auth/update-profile`, settings, { headers: authHeaders() });
      if (res.data.success) {
        toast.success("Settings updated successfully!", { id: tid });
        setHasChanges(false);
      }
    } catch (err) {
      toast.error("Failed to update settings", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const tid = toast.loading("Verifying and updating password...");
    try {
      const res = await axios.put(`${API}/auth/change-password`, passwordForm, { headers: authHeaders() });
      if (res.data.success) {
        toast.success("Password changed successfully!", { id: tid });
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed", { id: tid });
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to DEACTIVATE this station? It will be hidden from the map immediately.")) return;
    
    setSaving(true);
    const tid = toast.loading("Executing deactivation protocol...");
    try {
      const res = await axios.put(`${API}/auth/update-station-status`, { stationStatus: 'Offline' }, { headers: authHeaders() });
      if (res.data.success) {
        toast.success("Station successfully deactivated and marked Offline.", { id: tid });
      }
    } catch (err) {
      toast.error("Failed to deactivate station", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Securing Preferences...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full pb-24 font-['Inter']">
      <Toaster position="top-right" />
      <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Account Settings</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage your security, financial details, and system preferences.</p>
        </div>

        {/* Profile & Security */}
        <section className="bg-[#1e293b] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-[#0f172a]/30">
            <h2 className="text-lg font-black text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Profile & Security</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Primary Admin Name</label>
                <input type="text" value={settings.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Login Email</label>
                <input type="email" value={settings.email} readOnly className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl px-4 py-3 text-slate-500 font-bold cursor-not-allowed" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-sm font-black text-white">Account Password</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Last changed: Recently</p>
              </div>
              <button onClick={() => setShowPasswordModal(true)} className="px-6 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        </section>

        {/* Financial Details */}
        <section className="bg-[#1e293b] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-[#0f172a]/30">
            <h2 className="text-lg font-black text-white flex items-center gap-2"><Landmark className="w-5 h-5 text-amber-400" /> Financial & Tax Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Account Holder Name</label>
                  <input type="text" value={settings.bankDetails.accountHolder} onChange={(e) => handleBankChange('accountHolder', e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bank Name</label>
                  <input type="text" value={settings.bankDetails.bankName} onChange={(e) => handleBankChange('bankName', e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Account Number</label>
                  <input type="text" value={settings.bankDetails.accountNumber} onChange={(e) => handleBankChange('accountNumber', e.target.value)} className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-black ${MONO}`} />
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">IFSC Code</label>
                  <input type="text" value={settings.bankDetails.ifscCode} onChange={(e) => handleBankChange('ifscCode', e.target.value)} className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-black ${MONO}`} />
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Business Tax ID (GST)</label>
                  <input type="text" value={settings.taxId} onChange={(e) => handleChange('taxId', e.target.value)} className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-black ${MONO}`} />
               </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-[#1e293b] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-[#0f172a]/30">
            <h2 className="text-lg font-black text-white flex items-center gap-2"><Bell className="w-5 h-5 text-purple-400" /> Notifications</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
             <span className="text-sm font-bold text-white">Enable Real-time Payout Alerts</span>
             <Toggle checked={settings.twoFactor} onChange={() => handleChange('twoFactor', !settings.twoFactor)} />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-3xl overflow-hidden mt-12 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-black text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Deactivate Station</h2>
            <p className="text-sm font-bold text-slate-400 mt-1">This will pause all services and hide your station from users.</p>
          </div>
          <button 
              onClick={handleDeactivate}
              disabled={saving}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              <Power className="w-4 h-4" /> Deactivate
            </button>
        </section>

      </div>

      <AnimatePresence>
        {hasChanges && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-t border-white/10 p-4 lg:pl-[260px]">
            <div className="max-w-[1000px] mx-auto flex items-center justify-between">
              <p className="text-sm font-black text-white">Unsaved configuration changes detected</p>
              <div className="flex gap-4">
                <button onClick={() => { fetchSettings(); setHasChanges(false); }} className="text-sm font-black text-slate-400 hover:text-white">Discard</button>
                <button onClick={handleSave} className="px-8 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 transition-all">Save Settings</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl p-6">
              <h3 className="text-lg font-black text-white mb-6">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <input type="password" placeholder="Current Password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
                <input type="password" placeholder="New Password" required value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
                <button type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-500/20">Update Security Key</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorSettings;
