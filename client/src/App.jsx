import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import VendorDocumentUpload from './pages/VendorDocumentUpload';
import VendorManagement from './pages/VendorManagement';
import StationNetwork from './pages/StationNetwork';
import ServiceCenters from './pages/ServiceCenters';
import EmergencySOS from './pages/EmergencySOS';
import GlobalPayments from './pages/GlobalPayments';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import AdminLayout from './components/Dashboard/AdminLayout';
import VendorLayout from './components/Dashboard/VendorLayout';
import VendorChargingDashboard from './pages/VendorChargingDashboard';
import VendorPortManagement from './pages/VendorPortManagement';
import VendorSessionHistory from './pages/VendorSessionHistory';
import VendorEarnings from './pages/VendorEarnings';
import VendorProfileManagement from './pages/VendorProfileManagement';
import VendorSettings from './pages/VendorSettings';
import ServiceLayout from './components/Dashboard/ServiceLayout';
import ServiceDashboard from './pages/ServiceDashboard';
import ServiceJobCards from './pages/ServiceJobCards';
import ServiceTechnicians from './pages/ServiceTechnicians';
import ServiceBilling from './pages/ServiceBilling';
import ServiceFeedback from './pages/ServiceFeedback';
import ServiceSOS from './pages/ServiceSOS';
import ServiceSettings from './pages/ServiceSettings';
import TechnicianDashboard from './pages/TechnicianDashboard';
import HybridLayout from './components/Dashboard/HybridLayout';
import HybridDashboard from './pages/HybridDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes - No Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload-document" element={<VendorDocumentUpload />} />

          {/* Super Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="vendors" element={<VendorManagement />} />
              <Route path="network" element={<StationNetwork />} />
              <Route path="services" element={<ServiceCenters />} />
              <Route path="sos" element={<EmergencySOS />} />
              <Route path="payments" element={<GlobalPayments />} />
              <Route path="users"    element={<UserManagement />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>
          </Route>

          {/* Main App Routes - Redirect all guest access to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />


          {/* ── Vendor Dashboard Layout ─────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['STATION_VENDOR']} />}>
            <Route path="/vendor" element={<VendorLayout />}>
              <Route index element={<Navigate to="/vendor/charging-dashboard" replace />} />
              <Route path="charging-dashboard" element={<VendorChargingDashboard />} />
              <Route path="ports"    element={<VendorPortManagement />} />
              <Route path="sessions" element={<VendorSessionHistory />} />
              <Route path="earnings" element={<VendorEarnings />} />
              <Route path="profile"  element={<VendorProfileManagement />} />
              <Route path="settings" element={<VendorSettings />} />
            </Route>
          </Route>

          {/* ── Service Center Layout ─────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['SERVICE_VENDOR']} />}>
            <Route path="/service" element={<ServiceLayout />}>
              <Route index element={<Navigate to="/service/dashboard" replace />} />
              <Route path="dashboard" element={<ServiceDashboard />} />
              <Route path="jobs" element={<ServiceJobCards />} />
              <Route path="technicians" element={<ServiceTechnicians />} />
              <Route path="billing" element={<ServiceBilling />} />
              <Route path="feedback" element={<ServiceFeedback />} />
              <Route path="sos" element={<ServiceSOS />} />
              <Route path="settings" element={<ServiceSettings />} />
            </Route>
          </Route>

          {/* ── Hybrid Vendor Portal ──────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['HYBRID_VENDOR']} />}>
            <Route path="/hybrid" element={<HybridLayout />}>
              <Route index element={<Navigate to="/hybrid/dashboard" replace />} />
              <Route path="dashboard" element={<HybridDashboard />} />
              <Route path="earnings" element={<VendorEarnings />} />
              <Route path="feedback" element={<ServiceFeedback />} />
              <Route path="service-bays" element={<ServiceDashboard />} />
              <Route path="jobs" element={<ServiceJobCards />} />
              <Route path="technicians" element={<ServiceTechnicians />} />
              <Route path="billing" element={<ServiceBilling />} />
              <Route path="sos" element={<ServiceSOS />} />
              <Route path="ports" element={<VendorPortManagement />} />
              <Route path="sessions" element={<VendorSessionHistory />} />
              <Route path="settings" element={<ServiceSettings />} />
            </Route>
          </Route>
          
          {/* Legacy Redirects */}
          <Route path="/vendor/hybrid-dashboard"  element={<Navigate to="/hybrid/dashboard" replace />} />
          <Route path="/vendor/service-dashboard" element={<Navigate to="/service/dashboard" replace />} />
          
          {/* ── Technician Dashboard ─────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
            <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
