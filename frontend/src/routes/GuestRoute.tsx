import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../features/store';

export interface GuestRouteProps {
  children?: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // If already authenticated, redirect to /dashboard
  if (isAuthenticated || token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
