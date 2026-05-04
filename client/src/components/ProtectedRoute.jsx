import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute - Restricts access based on authentication and role
 * @param {Array} allowedRoles - Roles allowed to access the route
 */
const ProtectedRoute = ({ allowedRoles }) => {
  if (!AuthContext) {
    console.error("ProtectedRoute: AuthContext variable is undefined! Check your imports.");
    return null;
  }
  const context = useContext(AuthContext);
  
  if (!context) {
    console.error("ProtectedRoute: AuthContext is undefined! Ensure ProtectedRoute is wrapped in AuthProvider.");
    return null;
  }

  const { user, loading } = context;
  
  if (loading) {
    console.log("ProtectedRoute: Currently loading...", { allowedRoles });
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Verifying Access...</p>
      </div>
    );
  }

  console.log("ProtectedRoute: Auth check", { 
    hasUser: !!user, 
    role: user?.role, 
    allowed: allowedRoles?.includes(user?.role) 
  });

  if (!user) {
    console.warn("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on their actual role if they try to access something forbidden
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STATION_VENDOR') return <Navigate to="/vendor/charging-dashboard" replace />;
    if (user.role === 'SERVICE_VENDOR') return <Navigate to="/service/dashboard" replace />;
    if (user.role === 'HYBRID_VENDOR') return <Navigate to="/hybrid/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
