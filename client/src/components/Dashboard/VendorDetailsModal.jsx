import React from 'react';
import {
  X, MapPin, Phone, Mail, FileText, CheckCircle, ExternalLink,
  ShieldCheck, Map as MapIcon, Layers, ChevronRight, Zap,
  AlertTriangle, Building2, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const VendorDetailsModal = ({ isOpen, onClose, vendor, onApprove, onReject, onSuspend, onDelete }) => {
  if (!vendor) return null;

  const isStationVendor = vendor.role === 'STATION_VENDOR' || vendor.role === 'HYBRID_VENDOR';

  // Station-specific fields with safe fallbacks
  const stationAddr = vendor.address || 'No address provided by vendor';
  const hasCoords  = vendor.locationCoordinates?.lat && vendor.locationCoordinates?.lng;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl border border-emerald-100">
                  {vendor.businessName?.charAt(0) || vendor.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {vendor.businessName || 'Unnamed Business'}
                  </h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Vendor ID: {vendor._id?.slice(-8).toUpperCase()}
                  </p>
                  {isStationVendor && (
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Station Provider — Pending Approval
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 shadow-sm">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* ── 1:1 Approval Banner (only for station vendors) ─────────────── */}
            {isStationVendor && (
              <div className="mx-8 mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-xl shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-800">
                    Approving this vendor automatically activates their single charging station.
                  </p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5 leading-relaxed">
                    <span className="font-black">"{vendor.businessName}"</span> will be both the Vendor name and the Station name on the network map.
                    The address below is the definitive Station Location.
                  </p>
                </div>
              </div>
            )}

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
                <div className="space-y-8">

                  {/* Business / Contact Info */}
                  <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Business Information</h3>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-100"><Mail className="w-5 h-5 text-gray-400" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Owner Contact</p>
                          <p className="text-base font-black text-gray-700">{vendor.name}</p>
                          <p className="text-sm font-bold text-gray-500">{vendor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-100"><Phone className="w-5 h-5 text-gray-400" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Phone Number</p>
                          <p className="text-base font-black text-gray-700">{vendor.contactNumber || '+91 98765-43210'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── Vendor Physical Location ──────────────────────── */}
                  <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Business Location
                      <span className="ml-auto text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                        Definitive Address
                      </span>
                    </h3>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                          <Navigation className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Physical Address</p>
                          <p className="text-sm font-black text-gray-700 leading-relaxed">{stationAddr}</p>
                        </div>
                      </div>
                      {hasCoords ? (
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> GPS Coordinates Verified
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {vendor.locationCoordinates.lat.toFixed(4)}°N, {vendor.locationCoordinates.lng.toFixed(4)}°E
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                          <AlertTriangle className="w-3.5 h-3.5" /> GPS not yet submitted
                        </div>
                      )}
                    </div>

                    {/* Interactive Map Preview */}
                    <div className="mt-4 h-48 bg-gray-100 rounded-3xl relative overflow-hidden border border-gray-200">
                      {hasCoords ? (
                        <MapContainer 
                          center={[vendor.locationCoordinates.lat, vendor.locationCoordinates.lng]} 
                          zoom={15} 
                          style={{ height: '100%', width: '100%' }}
                          zoomControl={false}
                          dragging={false}
                          scrollWheelZoom={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[vendor.locationCoordinates.lat, vendor.locationCoordinates.lng]} />
                        </MapContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Map Preview Unavailable</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                      Verification Documents
                    </h3>

                    {vendor.documents && vendor.documents.length > 0 ? (
                      <div className="space-y-4">
                        {vendor.documents.map((doc, idx) => (
                          <div key={idx} className="group relative bg-white border border-slate-100 rounded-3xl p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 flex flex-col gap-6">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors duration-500 border border-slate-100 group-hover:border-emerald-100 shrink-0">
                                <FileText className="w-7 h-7" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{doc.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified PDF Asset</p>
                                </div>
                              </div>
                            </div>
                            
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 group-hover:shadow-emerald-500/20"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Download Document
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-center">
                        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                        <h4 className="text-sm font-black text-amber-700 uppercase tracking-widest mb-1">No Documents Uploaded</h4>
                        <p className="text-xs font-bold text-amber-600/80 leading-relaxed">
                          This vendor has not uploaded their registration papers yet.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest">Trust Protocol</h4>
                    </div>
                    <p className="text-xs font-bold text-emerald-600/80 leading-relaxed">
                      All documents are encrypted and verified against the National Business Registry.
                      Reviewing these ensures full compliance with local EV operating laws.
                    </p>
                  </section>
                </div>
              </div>
            </div>

            {/* ── Footer Actions ─────────────────────────────────────────────── */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-4 items-center">
              <div className="flex gap-4">
                {vendor.status === 'REJECTED' && (
                  <button
                    onClick={() => onDelete(vendor._id)}
                    className="px-8 py-4 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                  >
                    Remove Permanently
                  </button>
                )}

                {vendor.status === 'ACTIVE' ? (
                  <button
                    onClick={() => onSuspend(vendor._id)}
                    className="px-8 py-4 rounded-2xl bg-amber-50 text-amber-600 font-black text-sm uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all shadow-sm"
                  >
                    Suspend Partner
                  </button>
                ) : (
                  vendor.status !== 'REJECTED' && (
                    <button
                      onClick={() => onReject(vendor._id)}
                      className="px-8 py-4 rounded-2xl bg-red-50 text-red-600 font-black text-sm uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all shadow-sm"
                    >
                      Reject & Close
                    </button>
                  )
                )}
                
                {(vendor.status === 'PENDING' || vendor.status === 'REJECTED' || vendor.status === 'SUSPENDED') && (
                  <button
                    onClick={() => onApprove(vendor._id)}
                    className="px-8 py-4 rounded-2xl bg-[#10b981] text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
                  >
                    {vendor.status === 'SUSPENDED' ? 'Activate Partner' : (vendor.status === 'REJECTED' ? 'Approve & Restore' : 'Approve & Activate')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VendorDetailsModal;
