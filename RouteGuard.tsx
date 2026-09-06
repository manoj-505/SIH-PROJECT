import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RouteGuardProps {
  children: ReactNode;
  allowedRole: 'patient' | 'doctor';
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRole }) => {
  const { activeRole } = useAuth();

  // If role is doctor and trying to access doctor routes, allow
  if (allowedRole === 'doctor' && activeRole !== 'doctor') {
    return <Navigate to="/doctor-login" replace />;
  }

  return <>{children}</>;
};
