
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthGuard = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state if auth state is still loading
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default AuthGuard;
