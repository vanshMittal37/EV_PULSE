import React, { useState, useEffect } from 'react';
import { socket } from '../utils/socket';
// API Client for Vendor Audits
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Zap,
  Wrench,
  Layers,
  ChevronRight,
  Download,
  AlertCircle,
  Building2,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import VendorDetailsModal from '../components/Dashboard/VendorDetailsModal';
import RegisterVendorModal from '../components/Dashboard/RegisterVendorModal';

const VendorManagement = () => {
  const { searchQuery, setSearchQuery } = useOutletContext();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    socket.on('new-vendor', (newVendor) => {
      console.log('Real-time: New vendor registered:', newVendor);
      // Immediately add the new vendor to the top of the list
      setVendors(prev => [newVendor, ...prev]);
      
      // Optionally show a toast
      toast.success(`New Vendor Registered: ${newVendor.businessName}`, {
        icon: '🚀',
        style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' }
      });
    });

    return () => {
      socket.off('new-vendor');
    };
  }, []);

  const fetchVendors = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch vendors');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/vendors/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Vendor ${status === 'ACTIVE' ? 'Approved' : 'Rejected'} Successfully!`, {
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          fontWeight: '900',
          fontSize: '14px',
          padding: '20px 28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        },
        iconTheme: {
          primary: status === 'ACTIVE' ? '#10b981' : '#ef4444',
          secondary: '#fff',
        },
      });

      fetchVendors();
      setModalOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to PERMANENTLY remove this vendor from the database? This action cannot be undone.')) return;
    
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Vendor permanently removed', {
        style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' }
      });

      fetchVendors();
      setModalOpen(false);
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    // When on the 'ALL' tab, show everything EXCEPT rejected vendors
    const matchesTab = activeTab === 'ALL' 
      ? vendor.status !== 'REJECTED' 
      : vendor.status === activeTab;

    const matchesSearch =
      vendor.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' ? true : vendor.role === typeFilter;

    return matchesTab && matchesSearch && matchesType;
  });

  const getRoleBadge = (role, vendor) => {
    const baseClass = "px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2.5 shadow-sm border";
    switch (role) {
      case 'STATION_VENDOR': {
        // Show port count for 1:1 station-vendor clarity
        const ports = vendor?.numberOfPorts || 2;
        return (
          <div className="flex flex-col gap-1.5">
            <span className={`${baseClass} bg-blue-50 text-blue-600 border-blue-100/50`}>
              <Zap className="w-3.5 h-3.5" /> Charging – {ports} Port{ports > 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">1 Station · 1 Vendor</span>
          </div>
        );
      }
      case 'SERVICE_VENDOR':
        return <span className={`${baseClass} bg-purple-50 text-purple-600 border-purple-100/50`}><Wrench className="w-3.5 h-3.5" /> Service Tech</span>;
      case 'HYBRID_VENDOR': {
        const ports = vendor?.numberOfPorts || 2;
        return (
          <div className="flex flex-col gap-1.5">
            <span className={`${baseClass} bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-emerald-500/20`}>
              <Layers className="w-3.5 h-3.5" /> Hybrid – {ports} Ports
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">1 Station · 1 Vendor</span>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'PENDING', label: 'Pending Audit', count: vendors.filter(v => v.status === 'PENDING').length, notify: true },
    { id: 'ACTIVE', label: 'Active Network', count: vendors.filter(v => v.status === 'ACTIVE').length },
    { id: 'REJECTED', label: 'Rejected', count: vendors.filter(v => v.status === 'REJECTED').length },
    { id: 'SUSPENDED', label: 'Suspended', count: vendors.filter(v => v.status === 'SUSPENDED').length },
  ];

  return (
    <div className="p-4 md:p-10 max-w-[1700px] mx-auto min-h-screen space-y-6 md:space-y-10">
      <Toaster position="bottom-right" />

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Vendor Management</h1>
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100">
                  <AlertCircle className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest">{vendors.filter(v => v.status === 'PENDING').length} Pending Action</span>
                </div>
              </div>
              <p className="text-slate-500 font-bold tracking-wide uppercase text-xs flex items-center gap-2">
                Centralized Control Panel <ChevronRight className="w-3 h-3 text-slate-300" /> 1 Vendor = 1 Station · Onboarding & Compliance
              </p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                Approving a vendor automatically activates their single charging station
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button 
            onClick={() => setRegisterModalOpen(true)}
            className="flex-1 xl:flex-none bg-[#10b981] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_12px_30px_-10px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <PlusCircle className="w-5 h-5" />
            Register Vendor + Station
          </button>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="bg-slate-100 p-2 rounded-3xl md:rounded-[2.5rem] flex flex-col sm:flex-row gap-2 md:gap-3 border border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 sm:min-w-[200px] px-4 sm:px-8 py-3 sm:py-5 rounded-2xl sm:rounded-[1.75rem] font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all relative flex items-center justify-center gap-2 sm:gap-4 ${activeTab === tab.id
                ? 'bg-[#10b981] text-white shadow-xl shadow-emerald-500/30 scale-[1.02]'
                : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
          >
            {tab.label}
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${activeTab === tab.id ? 'bg-white text-[#10b981]' : 'bg-slate-200 text-slate-600'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl group-focus-within:bg-emerald-100 transition-colors">
              <Search className="w-6 h-6 text-slate-400 group-focus-within:text-[#10b981]" />
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
          </div>
          <input
            type="text"
            placeholder="Search by Business Name, Owner, or Email ID..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2rem] py-4 md:py-7 pl-20 md:pl-28 pr-8 focus:outline-none focus:border-[#10b981] focus:ring-[12px] focus:ring-emerald-500/5 transition-all font-black text-slate-900 text-sm md:text-xl placeholder:text-slate-300 placeholder:font-bold shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block">
            <span className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
              Search Database
            </span>
          </div>
        </div>

        <div className="lg:w-[400px] relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-slate-100 rounded-2xl group-focus-within:bg-emerald-100 transition-colors">
            <Filter className="w-6 h-6 text-slate-400 group-focus-within:text-[#10b981]" />
          </div>
          <select 
            className="w-full bg-white border-2 border-slate-100 rounded-2xl md:rounded-[2rem] py-4 md:py-7 pl-16 md:pl-20 pr-12 focus:outline-none focus:border-[#10b981] transition-all font-black text-slate-900 uppercase tracking-widest text-xs md:text-sm appearance-none cursor-pointer shadow-sm text-center"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Partner Categories</option>
            <option value="STATION_VENDOR">Charging Infrastructure</option>
            <option value="SERVICE_VENDOR">Maintenance & Service</option>
            <option value="HYBRID_VENDOR">Hybrid Power Partners</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none p-1 bg-slate-50 rounded-lg">
             <ChevronRight className="w-6 h-6 rotate-90 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.05)] overflow-hidden">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Synchronizing Global Network...</p>
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="px-10 py-10 text-[13px] font-black text-slate-100 uppercase tracking-[0.25em]">Vendor / Station Name</th>
                  <th className="px-10 py-10 text-[13px] font-black text-slate-100 uppercase tracking-[0.25em]">Contact Authority</th>
                  <th className="px-10 py-10 text-[13px] font-black text-slate-100 uppercase tracking-[0.25em]">Station Type</th>
                  <th className="px-10 py-10 text-[13px] font-black text-slate-100 uppercase tracking-[0.25em]">Enrollment Date</th>
                  <th className="px-10 py-10 text-[13px] font-black text-slate-100 uppercase tracking-[0.25em]">Status</th>
                  <th className="px-10 py-10 text-[13px] font-black text-slate-100 uppercase tracking-[0.25em] text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                    <td className="px-10 py-10">
                       <p className="text-2xl font-black text-slate-900 tracking-tighter mb-1.5 group-hover:text-[#10b981] transition-colors">
                         {vendor.businessName || 'Elite Partner'}
                       </p>
                       <div className="flex items-center gap-2">
                         <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                         <p className="text-sm font-black text-slate-500 uppercase tracking-widest">System UID: {vendor._id.slice(-8).toUpperCase()}</p>
                       </div>
                    </td>
                    <td className="px-10 py-10">
                       <p className="text-xl font-black text-slate-700 tracking-tight">{vendor.name}</p>
                       <p className="text-base font-bold text-slate-400 mt-1">{vendor.email}</p>
                    </td>
                    <td className="px-10 py-10">
                      {getRoleBadge(vendor.role, vendor)}
                    </td>
                    <td className="px-10 py-10">
                      <p className="text-lg font-black text-slate-500 tabular-nums">
                        {new Date(vendor.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-sm font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Registry Validated
                      </p>
                    </td>
                    <td className="px-10 py-10">
                       <span className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] shadow-sm border ${
                         vendor.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                         vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         vendor.status === 'SUSPENDED' ? 'bg-slate-900 text-slate-200 border-slate-800' :
                         'bg-red-50 text-red-600 border-red-100'
                       }`}>
                         {vendor.status}
                       </span>
                    </td>
                    <td className="px-10 py-10">
                      <div className="flex items-center justify-end gap-5">
                        <button
                          onClick={() => { setSelectedVendor(vendor); setModalOpen(true); }}
                          className="flex items-center gap-3 px-6 py-4 bg-slate-50 text-[#10b981] hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-slate-900 shadow-sm hover:shadow-2xl group/btn"
                        >
                          <Eye className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-[11px] font-black uppercase tracking-widest hidden xl:block">Review Profile</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-center px-10">
            <div className="w-40 h-40 bg-slate-50 rounded-[4rem] flex items-center justify-center mb-10 relative">
              <Users className="w-20 h-20 text-slate-200" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-slate-300" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">No Partners Found</h3>
            <p className="text-slate-500 font-bold max-w-md text-lg leading-relaxed mb-10">We couldn't find any vendors matching your current search parameters or category filters.</p>
            <button
              onClick={() => { setActiveTab('PENDING'); setSearchQuery(''); setTypeFilter('ALL'); }}
              className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <VendorDetailsModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        vendor={selectedVendor}
        onApprove={(id) => handleStatusUpdate(id, 'ACTIVE')}
        onReject={(id) => handleStatusUpdate(id, 'REJECTED')}
        onSuspend={(id) => handleStatusUpdate(id, 'SUSPENDED')}
        onDelete={(id) => handleDeleteVendor(id)}
      />

      {/* Instant Registration Modal */}
      <RegisterVendorModal
        isOpen={isRegisterModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onRegisterSuccess={() => {
          fetchVendors();
          setActiveTab('ACTIVE'); // Switch to active tab to see the new vendor
        }}
      />
    </div>
  );
};

export default VendorManagement;

