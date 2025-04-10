
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  // Check if route requires admin and if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminUser = user?.role === 'admin';

  // Show loading state if auth state is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect if trying to access admin route without admin privileges
  if (isAdminRoute && !isAdminUser) {
    return <Navigate to="/home" replace />;
  }

  // Render child routes if authorized
  return <Outlet />;
};

export default AuthGuard;
