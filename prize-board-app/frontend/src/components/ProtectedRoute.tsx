import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, role }: { children: JSX.Element; role?: 'admin' | 'user' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-slate-300">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};
