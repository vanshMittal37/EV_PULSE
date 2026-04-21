import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
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

          {/* Main App Routes - With Navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stations" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Charging Stations Placeholder</h1></div>} />
            <Route path="/services" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Services Placeholder</h1></div>} />
            {/* Admins & Vendor Dashboards Placeholders */}
            <Route path="/admin/dashboard" element={<div className="p-8 text-center text-white"><h1 className="text-3xl font-bold">Super Admin Dashboard</h1></div>} />
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
