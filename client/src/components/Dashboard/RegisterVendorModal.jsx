import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Mail, Lock, Phone, Building2, MapPin, 
  BatteryCharging, Wrench, Layers, Zap, Search, Loader2 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RegisterVendorModal = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STATION_VENDOR',
    businessName: '',
    contactNumber: '',
    address: '',
    lat: '',
    lng: '',
    numberOfPorts: 2
  });

  const handleSearchAddress = async () => {
    if (!formData.address.trim()) return;
    const toastId = toast.loading('Searching location...');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          lat: data[0].lat,
          lng: data[0].lon
        }));
        toast.success('Location pinned on GPS!', { id: toastId });
      } else {
        toast.error('Location not found', { id: toastId });
      }
    } catch (err) {
      toast.error('Geocoding service failed', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      toast.error('Please verify the location on GPS first');
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/vendors/register', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vendor Registered & Activated Directly!');
      onRegisterSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'STATION_VENDOR', label: 'Charging Station', icon: BatteryCharging, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'SERVICE_VENDOR', label: 'Service Center', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'HYBRID_VENDOR', label: 'Hybrid Power', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Instant Registration</h2>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1.5">Direct Network Activation (Skip Audit)</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Role Selection */}
                <div className="grid grid-cols-3 gap-4">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({...formData, role: role.id})}
                      className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
                        formData.role === role.id 
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' 
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <role.icon className={`w-6 h-6 ${formData.role === role.id ? 'text-emerald-500' : 'text-gray-400'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === role.id ? 'text-emerald-700' : 'text-gray-500'}`}>
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-1">Business Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input required
                        placeholder="Enter business name"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none placeholder:text-gray-400 text-gray-900"
                        value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-1">Owner Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input required
                        placeholder="Full name of owner"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white transition-all outline-none placeholder:text-gray-400 text-gray-900"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-1">Email ID</label>
                    <input required type="email"
                      placeholder="email@example.com"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white transition-all outline-none placeholder:text-gray-400 text-gray-900"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-1">Temporary Password</label>
                    <input required type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white transition-all outline-none placeholder:text-gray-400 text-gray-900"
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-1">Contact Number</label>
                    <input required
                      placeholder="+91 00000-00000"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white transition-all outline-none placeholder:text-gray-400 text-gray-900"
                      value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                    />
                  </div>
                  {formData.role !== 'SERVICE_VENDOR' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-1">Number of Ports</label>
                      <input required type="number" min="1"
                        placeholder="Ex: 2"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white transition-all outline-none placeholder:text-gray-400 text-gray-900"
                        value={formData.numberOfPorts} onChange={e => setFormData({...formData, numberOfPorts: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {/* Location Section */}
                <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-1">Physical Address</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none placeholder:text-gray-400 text-gray-900"
                          placeholder="Ex: 123 MG Road, Mumbai..."
                          value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                      <button type="button" onClick={handleSearchAddress} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2">
                        <Search className="w-4 h-4" /> Verify GPS
                      </button>
                    </div>
                  </div>

                  {formData.lat && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                        <Zap className="w-3 h-3" />
                      </div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                        GPS Locked: {parseFloat(formData.lat).toFixed(4)}°N, {parseFloat(formData.lng).toFixed(4)}°E
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-[#10b981] text-white rounded-[2rem] font-black text-base uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Activate Global Partner'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterVendorModal;

