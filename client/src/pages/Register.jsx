import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BatteryCharging, Wrench, ShieldCheck, EyeOff, Eye, MapPin, User, Mail, Briefcase, Phone } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    contactNumber: '',
    role: 'STATION_VENDOR',
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // We don't save to database yet as per user request.
    // Account is only created in the next step (Document Upload).
    sessionStorage.setItem('pending_registration', JSON.stringify(formData));
    navigate('/upload-document');
    setLoading(false);
  };

  const roleOptions = [
    { id: 'STATION_VENDOR', label: 'Charging Station Owner', icon: BatteryCharging },
    { id: 'SERVICE_VENDOR', label: 'Service Center Owner', icon: Wrench },
    { id: 'HYBRID_VENDOR', label: 'Hybrid (Both)', icon: MapPin },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in zoom-in duration-300">
           <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
             <ShieldCheck className="h-10 w-10 text-emerald-600" />
           </div>
           <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
           <p className="text-gray-600 mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 font-medium text-sm shadow-inner text-left flex gap-3 items-start">
             <span className="mt-1">⏳</span>
             Your account is awaiting Super Admin approval. Once active, you will be able to log into the vendor portal.
           </p>
           <button 
             onClick={() => navigate('/login')}
             className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/30 text-white font-bold py-3 px-4 rounded-xl transition duration-300 hover:-translate-y-[2px]"
           >
             Return to Login
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-[90vw] max-w-[1400px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Branding (Space Navy & Electric Green glow) */}
        <div className="w-full md:w-2/5 bg-slate-900 p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900" />
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight uppercase font-inter drop-shadow-md">
              EV CONNECT <br/>
              <span className="text-5xl text-emerald-500 mt-2 block tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">NETWORK</span>
            </h2>
            
            <div className="my-10 relative w-64 h-64 flex items-center justify-center group overflow-hidden rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-500/30 bg-slate-800 transition-all duration-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.8)]">
               <img 
                 src="/ev-illustration.png" 
                 alt="Charging an EV" 
                 className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700 mix-blend-screen"
               />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">JOIN THE REVOLUTION</h3>
            <p className="text-gray-300 text-sm max-w-sm leading-relaxed">
              Partner with EV Connect to host cutting-edge charging stations or provide expert maintenance services. Shape the future of mobility today.
            </p>
          </div>
        </div>

        {/* Responsive Header for Mobile */}
        <div className="w-full bg-slate-900 p-6 flex flex-col items-center justify-center text-center md:hidden relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900" />
          <h2 className="text-2xl font-extrabold text-white tracking-wide relative z-10">
            EV CONNECT <span className="text-emerald-500">NETWORK</span>
          </h2>
        </div>

        {/* Right Side: Form (60%) */}
        <div className="w-full md:w-3/5 p-6 md:p-12 relative overflow-y-auto max-h-[90vh]">
          
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vendor Registration</h3>
            <p className="text-gray-500 mt-2 font-medium">Create your business account to get started.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200 flex items-center shadow-sm">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Role Selection using Modern Cards */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800">Select Business Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roleOptions.map((role) => {
                  const isActive = formData.role === role.id;
                  return (
                    <div 
                      key={role.id}
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`cursor-pointer rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 border-2 ${
                        isActive 
                          ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.3)] transform -translate-y-1' 
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      <role.icon className={`h-8 w-8 mb-3 transition-colors duration-300 ${isActive ? 'text-emerald-500 drop-shadow-md' : 'text-gray-400'}`} />
                      <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-emerald-700' : 'text-gray-600'}`}>
                        {role.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
               <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="text" required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
               </div>
               <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email" required
                      placeholder="vendor@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Business Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text" required
                      placeholder="EcoCharge Corp"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
               </div>
               <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Contact Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel" required
                      placeholder="+1 (555) 000-0000"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
               </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   {showPassword ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-emerald-500 transition-colors bg-white px-2"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold py-4 px-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_20px_0_rgba(16,185,129,0.4)] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none mt-4 text-sm tracking-widest uppercase"
            >
              {loading ? 'Submitting Registration...' : 'Register Business Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 font-medium">
             Already have an account?{' '}
             <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors ml-1 hover:underline underline-offset-4">
               Log in here
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
