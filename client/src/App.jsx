import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import VendorManagement from './pages/VendorManagement';
import StationNetwork from './pages/StationNetwork';
import ServiceCenters from './pages/ServiceCenters';
import EmergencySOS from './pages/EmergencySOS';
import GlobalPayments from './pages/GlobalPayments';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import AdminLayout from './components/Dashboard/AdminLayout';
import { AuthProvider } from './context/AuthContext';

const MainLayout = () => (
  <div className="min-h-screen bg-ev-dark text-white font-sans bg-gray-900 flex flex-col">
    <Navbar />
    <main className="flex-1 w-full flex flex-col justify-center">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes - No Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Super Admin Dashboard - Nested under AdminLayout */}
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

          {/* Main App Routes - With Navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stations" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Charging Stations Placeholder</h1></div>} />
            <Route path="/services" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Services Placeholder</h1></div>} />
            {/* Admins & Vendor Dashboards Placeholders */}
            <Route path="/vendor/charging-dashboard" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Charging Station Vendor Portal</h1></div>} />
            <Route path="/vendor/service-dashboard" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Service Center Vendor Portal</h1></div>} />
            <Route path="/vendor/hybrid-dashboard" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Hybrid Vendor Portal</h1></div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
