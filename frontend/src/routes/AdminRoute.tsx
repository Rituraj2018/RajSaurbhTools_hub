import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../features/store';

/**
 * AdminRoute — guards routes that require role="admin".
 * Unauthenticated users → /login
 * Authenticated non-admin users → /dashboard
 */
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
