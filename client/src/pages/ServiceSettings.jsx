import React, { useState, useContext } from 'react';
import {
  Settings, User, Shield, Bell, Clock, LogOut, Camera,
  Mail, Phone, Building2, Eye, EyeOff, CheckCircle,
  AlertTriangle, HelpCircle, Power
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";

const ServiceSettings = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  // Profile
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.contactNumber || '');
  const workshopName = user?.businessName || 'Apex Service Center';

  // Password
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passError = newPass && confirmPass && newPass !== confirmPass;

  // Workshop Status
  const [accepting, setAccepting] = useState(user?.stationStatus === 'Active');

  // Notifications
  const [notifRevenue, setNotifRevenue] = useState(true);
  const [notifSOS, setNotifSOS] = useState(true);
  const [notifJobDone, setNotifJobDone] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API}/auth/update-profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          name: fullName,
          contactNumber: mobile
        })
      });
      const data = await res.json();
      if (data.success) {
        updateUser(data.data);
        toast.success('Profile updated successfully!', {
          style: { background: '#10b981', color: '#0f172a', fontWeight: '900' }
        });
      }
    } catch (err) { toast.error("Update failed"); }
  };

  const handleUpdatePassword = async () => {
    if (!currentPass) return toast.error('Enter your current password.');
    if (!newPass) return toast.error('Enter a new password.');
    if (passError) return toast.error('Passwords do not match.');
    if (newPass.length < 6) return toast.error('Password must be at least 6 characters.');

    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPass(''); setNewPass(''); setConfirmPass('');
        toast.success('Password updated successfully!', {
          style: { background: '#10b981', color: '#0f172a', fontWeight: '900' }
        });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) { toast.error("Connection error"); }
  };

  const toggleWorkshopStatus = async () => {
    const newStatus = accepting ? 'Offline' : 'Active';
    try {
      const res = await fetch(`${API}/auth/update-station-status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ stationStatus: newStatus })
      });
      if (res.ok) {
        setAccepting(!accepting);
        toast(newStatus === 'Active' ? 'Workshop is now accepting alerts!' : 'Workshop marked as closed.', {
          icon: newStatus === 'Active' ? '🟢' : '🔴',
          style: { background: newStatus === 'Active' ? '#10b981' : '#1e293b', color: newStatus === 'Active' ? '#0f172a' : '#ef4444', fontWeight: '900' }
        });
        // Optionally update global user state
        updateUser({ ...user, stationStatus: newStatus });
      }
    } catch (err) { toast.error("Failed to update status"); }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const anim = (delay) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay } });

  return (
    <div className="relative min-h-full pb-24">
      <Toaster position="top-center" />

      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div {...anim(0)}>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Settings className="w-10 h-10 text-[#10b981]" /> Settings
          </h1>
          <p className="text-base font-bold text-slate-500 mt-2">Manage your profile, security, and workshop preferences.</p>
        </motion.div>

        {/* ── Section: Profile ─────────────────────────────── */}
        <motion.div {...anim(0.05)} className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-white/5 bg-[#0f172a]/30">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Profile Information
            </h2>
          </div>
          <div className="p-8 space-y-8">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <p className="text-xl font-black text-white">{fullName}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Service Vendor</p>
                <p className="text-xs font-bold text-slate-500 mt-1">Click avatar to upload a new photo</p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-[#10b981]/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Work Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-[#10b981]/50 focus:outline-none ${MONO}`} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Mobile Number
                </label>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)}
                  className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-base font-bold text-white focus:border-[#10b981]/50 focus:outline-none ${MONO}`} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Workshop Name
                </label>
                <div className="w-full bg-[#0f172a]/50 border border-white/5 rounded-xl px-5 py-4 text-base font-black text-slate-300 cursor-not-allowed">
                  {workshopName}
                </div>
              </div>
            </div>

            <button onClick={handleSaveProfile}
              className="px-8 py-4 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Save Changes
            </button>
          </div>
        </motion.div>

        {/* ── Section: Security ────────────────────────────── */}
        <motion.div {...anim(0.1)} className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-white/5 bg-[#0f172a]/30">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" /> Security & Password
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Current Password</label>
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 pr-14 text-base font-bold text-white focus:border-amber-500/50 focus:outline-none" />
                  <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">New Password</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className={`w-full bg-[#0f172a] border rounded-xl px-5 py-4 pr-14 text-base font-bold text-white focus:outline-none ${
                      passError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                    }`} />
                  <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full bg-[#0f172a] border rounded-xl px-5 py-4 pr-14 text-base font-bold text-white focus:outline-none ${
                      passError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'
                    }`} />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passError && (
                  <p className="text-xs font-black text-red-400 mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Passwords do not match.
                  </p>
                )}
              </div>
            </div>

            <button onClick={handleUpdatePassword}
              className="px-8 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2">
              <Shield className="w-5 h-5" /> Update Password
            </button>
          </div>
        </motion.div>

        {/* ── Section: Workshop Status ─────────────────────── */}
        <motion.div {...anim(0.15)} className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-white/5 bg-[#0f172a]/30">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Power className="w-5 h-5 text-emerald-400" /> Workshop Status
            </h2>
          </div>
          <div className="p-8 space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between bg-[#0f172a] rounded-2xl p-6 border border-white/5">
              <div>
                <p className="text-base font-black text-white mb-1">Accepting SOS & Appointments</p>
                <p className={`text-sm font-black uppercase tracking-widest ${accepting ? 'text-emerald-400' : 'text-red-400'}`}>
                  {accepting ? '● Workshop Open — Receiving Alerts' : '● Workshop Busy / Closed'}
                </p>
              </div>
              <button onClick={toggleWorkshopStatus}
                className={`relative w-16 h-9 rounded-full transition-all duration-300 ${accepting ? 'bg-[#10b981]' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300 ${accepting ? 'left-8' : 'left-1'}`} />
              </button>

            </div>

            {/* Working Hours */}
            <div className="flex items-center gap-4 bg-[#0f172a] rounded-2xl p-6 border border-white/5">
              <Clock className="w-6 h-6 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Working Hours</p>
                <p className={`text-lg font-black text-white ${MONO}`}>Mon – Sat : 9:00 AM – 7:00 PM</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Section: Notifications ───────────────────────── */}
        <motion.div {...anim(0.2)} className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-white/5 bg-[#0f172a]/30">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" /> Notification Preferences
            </h2>
          </div>
          <div className="p-8 space-y-2">
            {[
              { label: 'Email me weekly revenue reports', value: notifRevenue, set: setNotifRevenue, icon: Mail },
              { label: 'Notify me on my phone for new SOS alerts', value: notifSOS, set: setNotifSOS, icon: AlertTriangle },
              { label: 'Alert me when a Service Boy completes a job', value: notifJobDone, set: setNotifJobDone, icon: CheckCircle },
            ].map((pref, i) => (
              <label key={i} className="flex items-center gap-5 p-5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                <input type="checkbox" checked={pref.value} onChange={() => pref.set(!pref.value)}
                  className="w-5 h-5 rounded accent-[#10b981] shrink-0" />
                <pref.icon className="w-5 h-5 text-slate-500 shrink-0" />
                <span className="text-base font-bold text-slate-300">{pref.label}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* ── Footer: Support & Logout ─────────────────────── */}
        <motion.div {...anim(0.25)} className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <button className="flex items-center gap-2 text-sm font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">
              <HelpCircle className="w-5 h-5" /> Contact Super Admin
            </button>
            <button onClick={handleLogout}
              className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2">
              <LogOut className="w-5 h-5" /> Logout & End Session
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ServiceSettings;
