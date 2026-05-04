import React, { useState, useEffect, useRef } from 'react';
import {
  Store, MapPin, Phone, Mail, FileText, Wifi, Coffee,
  UploadCloud, Clock, ShieldAlert, CheckCircle, Star, Image as ImageIcon,
  Cctv, Utensils, AlertTriangle, X, Trash2, Camera, Map, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;

const AMENITIES_LIST = [
  { id: 'wifi', icon: Wifi, label: 'Free WiFi' },
  { id: 'cafe', icon: Coffee, label: 'Cafe / Dining' },
  { id: 'restroom', icon: Utensils, label: 'Restrooms' },
  { id: 'cctv', icon: Cctv, label: 'CCTV Security' },
  { id: 'lounge', icon: Store, label: 'Waiting Lounge' },
  { id: 'prayer', icon: ShieldAlert, label: 'Praying Room' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const VendorProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    businessName: '',
    address: '',
    contactNumber: '',
    email: '',
    description: '',
    amenities: [],
    is24x7: true,
    schedule: DAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '08:00', close: '22:00' } }), {}),
    stationImages: []
  });

  const authHeaders = (isMultipart = false) => ({
    'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: authHeaders() });
      if (res.data.success) {
        const u = res.data.data;
        setProfile({
          businessName: u.businessName || '',
          address: u.address || '',
          contactNumber: u.contactNumber || '',
          email: u.email || '',
          description: u.description || '',
          amenities: u.amenities || [],
          is24x7: u.is24x7 !== undefined ? u.is24x7 : true,
          schedule: u.schedule || DAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '08:00', close: '22:00' } }), {}),
          stationImages: u.stationImages || []
        });
      }
    } catch (err) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleAmenity = (id) => {
    setProfile(prev => {
      const amenities = prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id];
      return { ...prev, amenities };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const tid = toast.loading("Saving station profile...");
    try {
      const res = await axios.put(`${API}/auth/update-profile`, profile, { headers: authHeaders() });
      if (res.data.success) {
        toast.success("Station Profile Updated Successfully!", { id: tid });
        setHasChanges(false);
      }
    } catch (err) {
      toast.error("Failed to update profile", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const tid = toast.loading("Uploading image to cloud...");
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.put(`${API}/auth/upload-station-image`, formData, { headers: authHeaders(true) });
      if (res.data.success) {
        toast.success("Image uploaded successfully!", { id: tid });
        setProfile(prev => ({ ...prev, stationImages: res.data.data }));
      }
    } catch (err) {
      toast.error("Upload failed", { id: tid });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (url) => {
    const tid = toast.loading("Removing image...");
    try {
      const res = await axios.delete(`${API}/auth/station-image`, { 
        headers: authHeaders(),
        data: { imageUrl: url } 
      });
      if (res.data.success) {
        toast.success("Image removed", { id: tid });
        setProfile(prev => ({ ...prev, stationImages: res.data.data }));
      }
    } catch (err) {
      toast.error("Failed to delete image", { id: tid });
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accessing Station Records...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full pb-24 font-['Inter']">
      <Toaster position="top-right" />
      <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 rounded-full blur-3xl" />
          
          <div className="flex items-start md:items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-[#0f172a] border-2 border-[#10b981]/50 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              {profile.stationImages.length > 0 ? (
                <img src={profile.stationImages[0]} alt="Station" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-10 h-10 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Global Registry Active
                </span>
                <span className="flex items-center gap-1 text-amber-400 text-sm font-black bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-current" /> 4.8
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter">{profile.businessName || 'Unnamed Station'}</h1>
              <p className="text-slate-400 font-bold text-sm mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {profile.address ? profile.address.split(',')[0] : 'Location Pending'}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5 w-full md:w-64 text-center backdrop-blur-sm">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Operational Status</p>
            <p className={`text-xl font-black ${profile.is24x7 ? 'text-emerald-400' : 'text-blue-400'}`}>
              {profile.is24x7 ? 'Open 24/7' : 'Scheduled Hours'}
            </p>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-px">
          {['general', 'amenities', 'media', 'schedule'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-black text-sm uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab 
                  ? 'border-[#10b981] text-[#10b981]' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'general' ? 'General Info' : 
               tab === 'amenities' ? 'Amenities' : 
               tab === 'media' ? 'Media & Photos' : 'Operational Hours'}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────────── */}
        <div className="bg-[#1e293b] border border-white/5 rounded-3xl p-6 lg:p-8 min-h-[400px]">
          
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Business Name</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" value={profile.businessName} onChange={e => handleChange('businessName', e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white font-bold focus:outline-none focus:border-[#10b981]/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Support Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" value={profile.contactNumber} onChange={e => handleChange('contactNumber', e.target.value)} className={`w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white font-bold focus:outline-none focus:border-[#10b981]/50 transition-colors ${MONO}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="email" value={profile.email} readOnly className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-slate-500 font-bold focus:outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Physical Address</label>
                  <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
                    <textarea value={profile.address} onChange={e => handleChange('address', e.target.value)} className="w-full bg-transparent text-white font-bold focus:outline-none resize-none mb-3" rows="2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Station Description</label>
                  <textarea value={profile.description} onChange={e => handleChange('description', e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-[#10b981]/50 transition-colors resize-none" rows="4" placeholder="Short bio about your station..." />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-black text-white mb-6">Select Available Facilities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {AMENITIES_LIST.map(({ id, icon: Icon, label }) => {
                  const isSelected = profile.amenities.includes(id);
                  return (
                    <button key={id} onClick={() => toggleAmenity(id)} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all relative ${isSelected ? 'bg-[#10b981]/10 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-[#0f172a] border-white/5 hover:border-white/20'}`}>
                      <Icon className={`w-8 h-8 ${isSelected ? 'text-[#10b981]' : 'text-slate-500'}`} />
                      <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-slate-400'}`}>{label}</span>
                      {isSelected && <div className="absolute top-3 right-3"><CheckCircle className="w-4 h-4 text-[#10b981]" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-4">Upload Station Photos</h3>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-white/10 hover:border-[#10b981]/50 bg-[#0f172a] rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group relative overflow-hidden"
                  >
                    {uploading && (
                      <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-10 flex items-center justify-center">
                         <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                      </div>
                    )}
                    <div className="w-16 h-16 bg-white/5 group-hover:bg-[#10b981]/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#10b981] transition-colors" />
                    </div>
                    <p className="text-lg font-bold text-white mb-2">Click to select station images</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">PNG, JPG up to 5MB</p>
                    <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-black text-sm rounded-xl transition-colors">
                      Browse Files
                    </button>
                  </div>
                </div>

                <div className="lg:w-1/3">
                  <h3 className="text-xl font-black text-white mb-4">Gallery ({profile.stationImages.length})</h3>
                  <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {profile.stationImages.length === 0 ? (
                      <div className="bg-[#0f172a] rounded-2xl p-8 border border-white/5 text-center">
                        <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No photos yet</p>
                      </div>
                    ) : (
                      profile.stationImages.map((url, i) => (
                        <div key={i} className="relative rounded-2xl overflow-hidden aspect-video bg-[#0f172a] border border-white/10 group cursor-zoom-in">
                          <img 
                            src={url} 
                            alt={`Station ${i}`} 
                            className="w-full h-full object-cover" 
                            onClick={() => setSelectedImage(url)}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(url); }} className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {i === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-[#10b981] text-[#0f172a] text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg">
                              Primary
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black text-white">24/7 Availability</h3>
                  <p className="text-sm font-bold text-slate-500 mt-1">Is your station open all day, every day?</p>
                </div>
                <div onClick={() => handleChange('is24x7', !profile.is24x7)} className={`relative w-14 h-8 rounded-full cursor-pointer transition-colors ${profile.is24x7 ? 'bg-[#10b981]' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${profile.is24x7 ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
              {!profile.is24x7 && (
                <div className="space-y-4">
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center justify-between bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                      <span className="text-sm font-black text-white w-32">{day}</span>
                      <div className="flex items-center gap-4">
                        <input type="time" value={profile.schedule[day]?.open || '08:00'} onChange={(e) => { const newSched = { ...profile.schedule, [day]: { ...profile.schedule[day], open: e.target.value } }; handleChange('schedule', newSched); }} className={`bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500 ${MONO}`} />
                        <span className="text-slate-500 font-bold">to</span>
                        <input type="time" value={profile.schedule[day]?.close || '22:00'} onChange={(e) => { const newSched = { ...profile.schedule, [day]: { ...profile.schedule[day], close: e.target.value } }; handleChange('schedule', newSched); }} className={`bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500 ${MONO}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {profile.is24x7 && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center"><CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" /><p className="text-sm font-black text-emerald-400">Your station is marked as completely 24/7.</p></div>}
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
          <div><h3 className="text-lg font-black text-white">Station Ownership</h3><p className="text-sm font-bold text-slate-500">Contact admin for ownership transfer or account closure.</p></div>
          <button onClick={() => setShowDeleteModal(true)} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-black text-sm uppercase tracking-widest transition-colors flex items-center gap-2">Request Deactivation</button>
        </div>
      </div>

      <AnimatePresence>
        {hasChanges && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-t border-white/10 p-4 lg:pl-[260px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 lg:px-8">
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /><p className="text-sm font-black text-white">Unsaved station modifications</p></div>
              <div className="flex items-center gap-4">
                <button onClick={() => { fetchProfile(); setHasChanges(false); }} className="px-6 py-2.5 text-sm font-black text-slate-400 hover:text-white transition-colors">Discard</button>
                <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-[#0f172a] rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Profile Updates'}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Image Lightbox ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-xl"
              onClick={() => setSelectedImage(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img src={selectedImage} alt="Full View" className="w-full h-full object-contain bg-black/40" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VendorProfileManagement;
