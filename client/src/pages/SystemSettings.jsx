import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Globe, Key, DollarSign, Shield, Database,
  Eye, EyeOff, Copy, Check, Upload, Save,
  ChevronRight, AlertTriangle, CheckCircle, RefreshCw,
  Trash2, UserMinus, Lock, Unlock, Terminal, X,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general',   label: 'General',          icon: Globe      },
  { id: 'api',       label: 'API Configuration', icon: Key        },
  { id: 'financial', label: 'Financial Rules',   icon: DollarSign },
  { id: 'security',  label: 'Security & Logs',   icon: Shield     },
  { id: 'backup',    label: 'Database Backup',   icon: Database   },
];

const AUDIT_LOGS = [
  { time: '2026-04-23 00:41', action: 'API Key updated', actor: 'superadmin',  type: 'warning' },
  { time: '2026-04-22 23:15', action: 'Payouts released — ₹10,12,850',  actor: 'superadmin', type: 'success' },
  { time: '2026-04-22 21:03', action: 'Sub-admin access revoked — dev@ev.in', actor: 'superadmin', type: 'error' },
  { time: '2026-04-22 18:30', action: 'Commission rate changed to 6%',  actor: 'superadmin', type: 'warning' },
  { time: '2026-04-22 12:00', action: 'System backup completed',        actor: 'system',      type: 'success' },
];

const SUB_ADMINS = [
  { id: 1, name: 'Dev Kumar',   email: 'dev@evconnect.in',    role: 'Finance Admin', active: true  },
  { id: 2, name: 'Riya Sharma', email: 'riya@evconnect.in',   role: 'Support Admin', active: true  },
  { id: 3, name: 'Amit Joshi',  email: 'amit@evconnect.in',   role: 'Ops Admin',     active: false },
];

// ── Reusable input components ──────────────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">{children}</label>
);
const Input = ({ className = '', ...props }) => (
  <input className={`w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${className}`} {...props} />
);
const SectionCard = ({ title, sub, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
    <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/60">
      <h3 className="text-base font-black text-gray-900 tracking-tight">{title}</h3>
      {sub && <p className="text-xs font-bold text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ── Secret Key Input ───────────────────────────────────────────────────────────
const SecretInput = ({ label, placeholder, defaultVal }) => {
  const [show, setShow]     = useState(false);
  const [val, setVal]       = useState(defaultVal || '');
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(val); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? 'text' : 'password'}
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button onClick={copy} className={`px-3 py-2 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
    </div>
  );
};

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 right-8 z-[2000] bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-black text-sm"
      >
        <CheckCircle className="w-4 h-4" /> Settings saved successfully!
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Main ───────────────────────────────────────────────────────────────────────
const SystemSettings = () => {
  const [activeTab, setActiveTab]   = useState('general');
  const [dirty, setDirty]           = useState(false);
  const [toast, setToast]           = useState(false);
  const [subAdmins, setSubAdmins]   = useState(SUB_ADMINS);

  // General
  const [platformName, setPlatformName] = useState('EV Connect');
  const [supportEmail, setSupportEmail] = useState('support@evconnect.in');
  const [maintenance, setMaintenance]   = useState(false);

  // Financial
  const [commission, setCommission]   = useState(6);
  const [gst, setGst]                 = useState('27AADCB2230M1ZP');
  const [taxPct, setTaxPct]           = useState(18);
  const [payoutSchedule, setPayoutSchedule] = useState('Weekly');

  // Security
  const [force2FA, setForce2FA]       = useState(true);
  const [gateway, setGateway]         = useState('sandbox');

  const markDirty = (fn) => (...args) => { fn(...args); setDirty(true); };

  const handleSave = () => {
    setDirty(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const revokeAdmin = (id) => setSubAdmins(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-slate-50 font-['Inter']">

      {/* ── Vertical Tab Sidebar ────────────────────────────────────────── */}
      <div className="w-56 shrink-0 bg-white border-r border-gray-100 p-4 flex flex-col gap-1 sticky top-0 h-screen">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Settings</p>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all w-full text-left ${
              activeTab === t.id
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-4 h-4 shrink-0" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content Area ───────────────────────────────────────────────── */}
      <div className="flex-1 p-8 overflow-y-auto pb-32">
        <div className="max-w-2xl">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">System Configuration</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-8">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <>
              <SectionCard title="Platform Identity" sub="Core branding and operational settings">
                <div>
                  <Label>Platform Name</Label>
                  <Input value={platformName} onChange={e => { setPlatformName(e.target.value); setDirty(true); }} />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input type="email" value={supportEmail} onChange={e => { setSupportEmail(e.target.value); setDirty(true); }} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gray-800">Maintenance Mode</p>
                    <p className="text-xs font-bold text-gray-400">Temporarily disable the platform for all users</p>
                  </div>
                  <ToggleSwitch checked={maintenance} onChange={markDirty(setMaintenance)} />
                </div>
                {maintenance && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-xs font-black text-amber-700">Platform is in maintenance mode. Mobile app users cannot log in.</p>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Branding Assets" sub="Upload platform logo and favicon">
                {['Platform Logo (PNG, 512×512)', 'Favicon (ICO, 32×32)'].map(lbl => (
                  <div key={lbl}>
                    <Label>{lbl}</Label>
                    <label className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                      <span className="text-sm font-bold text-gray-500 group-hover:text-emerald-600">Click to upload or drag & drop</span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                ))}
              </SectionCard>
            </>
          )}

          {/* ── API ── */}
          {activeTab === 'api' && (
            <>
              <SectionCard title="Google Maps API" sub="Used for Station Network maps and location services">
                <SecretInput label="API Key" placeholder="AIzaSy..." defaultVal="AIzaSyD4x9Qk2mR7hLpWnT1vBcXeYuZ8fGjKoM" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gray-800">Enable Maps Embed</p>
                    <p className="text-xs font-bold text-gray-400">Show interactive maps on Station Network page</p>
                  </div>
                  <ToggleSwitch checked={true} onChange={() => setDirty(true)} />
                </div>
              </SectionCard>

              <SectionCard title="Payment Gateway — Razorpay" sub="Processes all charging and service payments">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-black text-gray-800">Environment Mode</p>
                    <p className="text-xs font-bold text-gray-400">Switch between sandbox and production</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {['sandbox', 'live'].map(m => (
                      <button key={m} onClick={() => { setGateway(m); setDirty(true); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${gateway === m ? (m === 'live' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white') : 'bg-slate-100 text-slate-600'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <SecretInput label="Key ID"     placeholder="rzp_test_..."   defaultVal="rzp_test_xK9mL2pQrB4wN7" />
                <SecretInput label="Key Secret" placeholder="Secret key..."  defaultVal="abc123secretKeyRazorpay987" />
              </SectionCard>

              <SectionCard title="SMS Gateway — Twilio" sub="Sends OTPs to mobile app users during login">
                <SecretInput label="Account SID"  placeholder="ACxxxxxxxx..." defaultVal="AC4e2f1a8b3c9d0e5f6a7b8c" />
                <SecretInput label="Auth Token"   placeholder="Auth token..."  defaultVal="a1b2c3d4e5f6789012345678" />
                <div><Label>From Number</Label><Input placeholder="+1 555 000 0000" defaultValue="+12025551234" onChange={() => setDirty(true)} /></div>
              </SectionCard>

              <SectionCard title="Cloud Storage — AWS S3" sub="Stores vendor KYC documents and user uploads">
                <div><Label>Bucket Name</Label><Input defaultValue="evconnect-uploads-prod" onChange={() => setDirty(true)} /></div>
                <div><Label>Region</Label><Input defaultValue="ap-south-1" onChange={() => setDirty(true)} /></div>
                <SecretInput label="Access Key ID"     defaultVal="AKIAIOSFODNN7EXAMPLE" />
                <SecretInput label="Secret Access Key" defaultVal="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" />
              </SectionCard>
            </>
          )}

          {/* ── FINANCIAL ── */}
          {activeTab === 'financial' && (
            <>
              <SectionCard title="Commission & Platform Fee" sub="The percentage EV Connect earns on every transaction">
                <div>
                  <Label>Global Platform Fee — {commission}%</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="range" min={1} max={20} value={commission}
                      onChange={e => { setCommission(Number(e.target.value)); setDirty(true); }}
                      className="flex-1 accent-emerald-500 h-2 rounded-full cursor-pointer"
                    />
                    <div className="w-16 text-center">
                      <input type="number" min={1} max={20} value={commission}
                        onChange={e => { setCommission(Number(e.target.value)); setDirty(true); }}
                        className="w-full px-2 py-1.5 text-center bg-slate-50 border border-gray-200 rounded-lg text-sm font-black text-gray-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-400 mt-2">Platform retains {commission}% of every charging session and service payment.</p>
                </div>
              </SectionCard>

              <SectionCard title="Taxation" sub="GST / VAT configuration for Indian market compliance">
                <div><Label>GST Registration Number</Label><Input value={gst} onChange={e => { setGst(e.target.value); setDirty(true); }} className="font-mono" /></div>
                <div>
                  <Label>Tax Percentage — {taxPct}%</Label>
                  <input type="range" min={0} max={28} value={taxPct}
                    onChange={e => { setTaxPct(Number(e.target.value)); setDirty(true); }}
                    className="w-full accent-emerald-500 h-2 rounded-full cursor-pointer mt-1"
                  />
                  <p className="text-xs font-bold text-gray-400 mt-1">Applied to all transactions. Current GST: {taxPct}%</p>
                </div>
              </SectionCard>

              <SectionCard title="Payout Schedule" sub="How often vendor balances are automatically settled">
                <div>
                  <Label>Automatic Payout Frequency</Label>
                  <select value={payoutSchedule} onChange={e => { setPayoutSchedule(e.target.value); setDirty(true); }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer">
                    {['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <p className="text-xs font-bold text-gray-400 mt-2">Next automatic payout: <span className="text-emerald-600">Sunday, 27 April 2026</span></p>
                </div>
              </SectionCard>
            </>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <>
              <SectionCard title="Two-Factor Authentication" sub="Enforce 2FA for all admin panel logins">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gray-800">Force 2FA for All Admins</p>
                    <p className="text-xs font-bold text-gray-400">Admins cannot log in without OTP verification</p>
                  </div>
                  <ToggleSwitch checked={force2FA} onChange={markDirty(setForce2FA)} />
                </div>
                {force2FA && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-xs font-black text-emerald-700">2FA is enforced. All admin logins require an OTP.</p>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Sub-Admin Access Control" sub="Manage admin users and their permissions">
                <div className="space-y-3">
                  {subAdmins.map(a => (
                    <div key={a.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${a.active ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${a.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                          {a.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{a.name}</p>
                          <p className="text-[11px] font-bold text-gray-400">{a.email} · {a.role}</p>
                        </div>
                      </div>
                      <button
                        disabled={!a.active}
                        onClick={() => { revokeAdmin(a.id); setDirty(true); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${a.active ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-gray-100 text-gray-400 cursor-default border border-gray-200'}`}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        {a.active ? 'Revoke' : 'Revoked'}
                      </button>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Audit Log" sub="Read-only feed of recent system events">
                <div className="bg-[#0f172a] rounded-xl p-4 font-mono text-xs space-y-2">
                  {AUDIT_LOGS.map((log, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-slate-500 shrink-0">{log.time}</span>
                      <span className={`${log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="text-slate-300">{log.action}</span>
                      <span className="text-slate-600 ml-auto shrink-0">— {log.actor}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {/* ── BACKUP ── */}
          {activeTab === 'backup' && (
            <>
              <SectionCard title="Database Backup" sub="Manage manual and scheduled backups of your MongoDB database">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-black text-gray-800">Last Backup</p>
                    <p className="text-xs font-bold text-emerald-600">2026-04-22 12:00 — Completed (124 MB)</p>
                  </div>
                  <button onClick={() => { setToast(true); setTimeout(() => setToast(false), 3000); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20">
                    <RefreshCw className="w-4 h-4" /> Backup Now
                  </button>
                </div>

                <div>
                  <Label>Backup Schedule</Label>
                  <select onChange={() => setDirty(true)} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer">
                    {['Every 6 Hours', 'Daily', 'Weekly'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Backup Retention</Label>
                  <select onChange={() => setDirty(true)} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500 cursor-pointer">
                    {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Unlimited'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Previous Backups</Label>
                  {['2026-04-22  —  124 MB', '2026-04-21  —  121 MB', '2026-04-20  —  119 MB'].map((b, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-700 font-mono">{b}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"><RefreshCw className="w-3.5 h-3.5 text-blue-500" /></button>
                        <button className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>

      {/* ── Floating Save Bar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-56 right-0 bg-white border-t border-gray-100 shadow-xl px-8 py-4 flex items-center justify-between z-[500]"
          >
            <p className="text-sm font-black text-gray-700">You have unsaved changes.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDirty(false)} className="px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Discard</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white text-sm font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast visible={toast} />
    </div>
  );
};

export default SystemSettings;
