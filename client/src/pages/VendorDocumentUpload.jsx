import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, ShieldCheck, AlertTriangle, MapPin, ExternalLink, Navigation, Search, Map, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ center }) => {
  const map = useMap();
  map.setView([center.lat, center.lng]);
  return null;
};

const LocationPicker = ({ position, setPosition, setAddress }) => {
  const map = useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      // Reverse Geocoding
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
      }
    },
  });
  return position === null ? null : (
    <Marker position={position} />
  );
};

const MONO = "font-['JetBrains_Mono',_'Courier_New',_monospace]";
const API = import.meta.env.VITE_API_URL;

const VendorDocumentUpload = () => {
  const [file, setFile] = useState(null);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 }); // Default New Delhi
  const [numPorts, setNumPorts] = useState(2);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const navigate = useNavigate();

  // Determine vendorRole to show/hide specific sections (check pending registration first)
  const getRole = () => {
    const pending = sessionStorage.getItem('pending_registration');
    if (pending) {
      try {
        return JSON.parse(pending).role;
      } catch (e) { return null; }
    }
    return sessionStorage.getItem('temp_vendor_role') || sessionStorage.getItem('user_role');
  };
  const vendorRole = getRole();

  const handleSearchAddress = async () => {
    if (!address.trim()) return;
    toast.loading('Searching for location...', { id: 'geo' });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
        toast.success('Location found and pinned!', { id: 'geo' });
      } else {
        toast.error('Location not found', { id: 'geo' });
      }
    } catch (err) {
      toast.error('Search failed', { id: 'geo' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter the location of your station');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('address', address);
    formData.append('lat', coords.lat);
    formData.append('lng', coords.lng);
    
    // Role specific details
    if (vendorRole !== 'SERVICE_VENDOR') {
      formData.append('numberOfPorts', numPorts);
    }

    try {
      const pendingData = JSON.parse(sessionStorage.getItem('pending_registration'));
      
      if (pendingData) {
        // Step 2 of New Vendor Flow: Register + Upload in one go
        Object.keys(pendingData).forEach(key => {
          formData.append(key, pendingData[key]);
        });

        const res = await fetch(`${API}/auth/register-with-documents`, {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        if (data.success) {
          toast.success('Account created and documents uploaded!');
          setUploaded(true);
          sessionStorage.removeItem('pending_registration');
        } else {
          toast.error(data.message || 'Registration failed');
        }
      } else {
        // Super Admin flow or direct upload: User already exists
        const token = sessionStorage.getItem('temp_vendor_token') || sessionStorage.getItem('token');
        const res = await fetch(`${API}/auth/upload-document`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const data = await res.json();
        if (data.success) {
          toast.success('Document uploaded successfully!');
          setUploaded(true);
          if (sessionStorage.getItem('temp_vendor_token')) {
            sessionStorage.removeItem('temp_vendor_token');
          }
        } else {
          toast.error(data.message || 'Upload failed');
        }
      }
    } catch (err) {
      toast.error('Server error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" />
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl relative z-10"
      >
        {!uploaded ? (
          <>
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <ShieldCheck className="w-10 h-10 text-blue-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter mb-3">Verification Required</h1>
              <p className="text-base font-bold text-slate-400">
                To approve your vendor account, we need your official station/service center registration documents.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Important Notice</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">
                  Please upload a single PDF file containing your GST Certificate, Business PAN, and Property/Lease agreement. Max size: 10MB.
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-colors rounded-3xl p-10 flex flex-col items-center justify-center text-center group bg-[#0f172a]/50 relative">
              <input 
                type="file" 
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-16 h-16 text-emerald-400 mb-4" />
                  <p className="text-lg font-black text-white mb-1">{file.name}</p>
                  <p className={`text-xs font-bold text-slate-500 ${MONO}`}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mt-4 group-hover:text-blue-300">
                    Click to change file
                  </p>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-16 h-16 text-slate-500 mb-4 group-hover:text-blue-400 transition-colors" />
                  <p className="text-lg font-black text-white mb-2">Drag & Drop your document here</p>
                  <p className="text-sm font-bold text-slate-500">or click to browse from your computer</p>
                </>
              )}
            </div>

            {/* Map Picker Section */}
            <div className="mb-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-blue-500" />
                Pin your Exact Location on Map
              </label>
              <div className="h-64 rounded-2xl overflow-hidden border border-white/10 shadow-inner z-0">
                <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={coords} setPosition={setCoords} setAddress={setAddress} />
                  <MapUpdater center={coords} />
                </MapContainer>
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-2 italic">
                * Click on the map to automatically fill your address, or search below.
              </p>
            </div>

            {/* Station Details Section (Only for Charging or Hybrid vendors) */}
            {vendorRole !== 'SERVICE_VENDOR' && (
              <div className="mb-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  Station Configuration
                </label>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-slate-300">How many charging ports are available at this station?</p>
                  <select 
                    value={numPorts}
                    onChange={(e) => setNumPorts(Number(e.target.value))}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-black"
                  >
                    {[1, 2, 4, 6, 8, 10, 12].map(num => (
                      <option key={num} value={num}>{num} Ports</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Address Input Section */}
            <div className="my-8">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Station / Service Center Address
                </label>
                <button 
                  onClick={handleSearchAddress}
                  className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" /> Find on Map
                </button>
              </div>
              <div className="relative">
                <div className="absolute top-4 left-4 text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete physical address..."
                  className="w-full bg-[#0f172a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none h-24"
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full py-5 rounded-xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                !file || isUploading 
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading securely...
                </>
              ) : (
                'Submit Documents'
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-10">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
              className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-4">Documents Submitted!</h1>
            <p className="text-base font-bold text-slate-400 mb-8">
              Your registration is now complete and awaiting review. Our team will verify your papers shortly.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('user');
                  navigate('/login');
                }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VendorDocumentUpload;

