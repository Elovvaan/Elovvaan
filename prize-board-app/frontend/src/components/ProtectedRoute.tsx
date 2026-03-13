import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types';

export const ProtectedRoute = ({ allow }: { allow: Role[] }) => {
  const { role } = useAuth();
  if (!allow.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
