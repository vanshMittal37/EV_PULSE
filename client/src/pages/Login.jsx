import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, BatteryCharging, Wrench, EyeOff, Eye, Mail, Lock, User, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('SUPER_ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: activeTab }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await login(data.data.email, data.data.password, data.data.token, data.data);

      const role = data.data.role;
      if (role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (role === 'STATION_VENDOR') navigate('/vendor/charging-dashboard');
      else if (role === 'SERVICE_VENDOR') navigate('/service/dashboard');
      else if (role === 'HYBRID_VENDOR') navigate('/hybrid/dashboard');
      else if (role === 'TECHNICIAN') navigate('/technician/dashboard');
      else navigate('/'); 
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'SUPER_ADMIN', label: 'SUPER ADMIN', icon: ShieldCheck },
    { id: 'STATION_VENDOR', label: 'CHARGING VENDOR', icon: BatteryCharging },
    { id: 'SERVICE_VENDOR', label: 'SERVICE VENDOR', icon: Wrench },
    { id: 'HYBRID_VENDOR', label: 'HYBRID VENDOR', icon: Zap },
    { id: 'TECHNICIAN', label: 'TECHNICIAN', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-[90vw] max-w-[1400px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Branding */}
        <div className="w-full md:w-5/12 bg-slate-900 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900" />
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight uppercase drop-shadow-md">
              EV CONNECT <br/>
              <span className="text-4xl text-emerald-500 mt-1 block tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                ADMIN PORTAL
              </span>
            </h2>
            
            <div className="my-12 relative w-64 h-64 border-2 border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_rgba(16,185,129,0.7)] group">
               <img 
                 src="/ev-illustration.png" 
                 alt="EV Car Illustration" 
                 className="absolute inset-0 w-full h-full object-cover rounded-full mix-blend-screen opacity-80 group-hover:scale-110 transition-transform duration-700"
               />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">MANAGE YOUR EV ECOSYSTEM</h3>
            <p className="text-emerald-50/70 text-sm leading-relaxed max-w-xs">
              Unified platform for Super Admins, Charging Stations, and Service Centers.
            </p>
          </div>
        </div>

        {/* Responsive Header for Mobile */}
        <div className="w-full bg-slate-900 p-6 flex flex-col items-center justify-center text-center md:hidden relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900" />
          <h2 className="text-2xl font-extrabold text-white tracking-wide relative z-10">
            ADMIN <span className="text-emerald-500">PORTAL</span>
          </h2>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 relative flex flex-col justify-center">
          
          {/* Role Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 border-2 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.3)] transform -translate-y-1'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <tab.icon className={`h-8 w-8 mb-3 transition-colors duration-300 ${isActive ? 'text-emerald-500 drop-shadow-md' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold tracking-wide uppercase ${isActive ? 'text-emerald-700' : 'text-gray-600'}`}>
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center mb-8">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {activeTab === 'SUPER_ADMIN' ? 'Secure Login' : 'Vendor Login'}
            </h3>
            <p className="text-gray-500 mt-2 font-medium">Please enter your details to access the portal.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200 flex items-center shadow-sm">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@evconnect.com"
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-16 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50/50 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-emerald-500 font-medium text-xs bg-white/0 px-2 transition-colors"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <a href="#" className="text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold py-4 px-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_20px_0_rgba(16,185,129,0.4)] disabled:opacity-70 mt-6 tracking-widest uppercase text-sm"
            >
              {loading ? <span className="animate-pulse">Authenticating...</span> : 'LOG IN'}
            </button>
          </form>

            <div className="mt-8 text-center text-sm text-gray-500 font-medium">
              {activeTab === 'SUPER_ADMIN' ? (
                 <span>Don't have an account? <span className="font-bold text-gray-900 hover:text-emerald-600 cursor-pointer transition-colors ml-1 underline underline-offset-4 decoration-emerald-500 decoration-2">Contact Super Admin</span></span>
              ) : (
                <span>
                 Don't have a vendor account?{' '}
                 <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors ml-1 hover:underline underline-offset-4">
                   Sign up here
                 </Link>
                </span>
              )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
