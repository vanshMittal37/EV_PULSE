import React from 'react';
import { X, MapPin, Phone, Mail, FileText, CheckCircle, ExternalLink, ShieldCheck, Map as MapIcon, Layers, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorDetailsModal = ({ isOpen, onClose, vendor, onApprove, onReject }) => {
  if (!vendor) return null;

  const documents = vendor.documents || [
    { name: 'Business Registration (GST)', status: 'Pending Verification' },
    { name: 'Identity Proof (Owner)', status: 'Verified' },
    { name: 'Operating License', status: 'Pending Verification' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl border border-emerald-100">
                  {vendor.businessName?.charAt(0) || vendor.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{vendor.businessName || 'Unnamed Business'}</h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Vendor ID: {vendor._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200 shadow-sm">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-8">
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
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-100"><MapPin className="w-5 h-5 text-gray-400" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Registered Address</p>
                          <p className="text-sm font-black text-gray-700 leading-relaxed">{vendor.address || '123 Tech Park, Sector 62, Noida, Uttar Pradesh 201301'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Location Preview</h3>
                    <div className="h-48 bg-gray-100 rounded-3xl relative overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200 group">
                      <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="flex flex-col items-center gap-2">
                           <MapIcon className="w-10 h-10 text-emerald-500 animate-bounce" />
                           <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Open in Google Maps</p>
                         </div>
                      </div>
                      <p className="text-gray-400 font-bold text-sm">Interactive Map Placeholder</p>
                    </div>
                  </section>
                </div>

                {/* Right Column: Documents */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                      Verification Documents
                      <button className="text-xs font-black text-[#10b981] flex items-center gap-2 hover:underline uppercase tracking-widest">
                        <ExternalLink className="w-4 h-4" /> Download All Documents
                      </button>
                    </h3>
                    
                    <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner">
                      {/* Document Header */}
                      <div className="p-6 flex items-center justify-between bg-white/50 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-50 rounded-xl text-red-500 shadow-sm">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none">BUSINESS REGISTRATION</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DOCUMENT PDF</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                           <Layers className="w-4 h-4" /> View Full
                        </button>
                      </div>

                      {/* PDF Previewer Area */}
                      <div className="p-6">
                        <div className="relative aspect-[4/5] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700/50 group">
                           {/* Mock PDF Content - Styled as a document */}
                           <div className="absolute inset-0 bg-white m-4 rounded shadow-lg p-10 flex flex-col gap-6 overflow-hidden select-none">
                              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                                <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl">EV</div>
                                <div className="text-right">
                                  <p className="text-[8px] font-black text-slate-400 uppercase">Official Document</p>
                                  <p className="text-[10px] font-black text-slate-900 mt-1 uppercase tracking-widest">October 15, 2026</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-base font-black text-slate-900 uppercase tracking-tighter">Business Name: {vendor.businessName}</h4>
                                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded inline-block">Status: Certified</p>
                                <div className="space-y-2 pt-4">
                                  <div className="h-2 w-full bg-slate-50 rounded"></div>
                                  <div className="h-2 w-[90%] bg-slate-50 rounded"></div>
                                  <div className="h-2 w-full bg-slate-50 rounded"></div>
                                  <div className="h-2 w-[80%] bg-slate-50 rounded"></div>
                                </div>
                                <div className="pt-10">
                                   <p className="text-[9px] font-bold text-slate-400 italic">"This document serves as proof of legal registration under the Digital EV Connect Governance Framework v4.0"</p>
                                </div>
                              </div>
                           </div>

                           {/* Preview Overlay */}
                           <div className="absolute top-4 left-4 right-4 py-2 px-4 bg-slate-900/80 backdrop-blur-md rounded-lg flex items-center justify-between border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">{vendor.businessName?.replace(/\s+/g, '_')}_Registration.pdf <span className="text-slate-400 ml-2">1 of 4</span></p>
                              <button className="px-4 py-1.5 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-[#10b981] hover:text-white transition-all shadow-lg">
                                Verify
                              </button>
                           </div>

                           {/* Bottom Navigation */}
                           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white transition-colors"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                              <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black">PAGE 1 / 4</div>
                              <button className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest">Trust Protocol</h4>
                    </div>
                    <p className="text-xs font-bold text-emerald-600/80 leading-relaxed">
                      All documents are encrypted and verified against the National Business Registry. Reviewing these ensures full compliance with local EV operating laws.
                    </p>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
              <button 
                onClick={() => onReject(vendor._id)}
                className="px-8 py-4 rounded-2xl bg-red-50 text-red-600 font-black text-sm uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all shadow-sm"
              >
                Reject & Close
              </button>
              <button 
                onClick={() => onApprove(vendor._id)}
                className="px-8 py-4 rounded-2xl bg-[#10b981] text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
              >
                Approve & Activate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VendorDetailsModal;
