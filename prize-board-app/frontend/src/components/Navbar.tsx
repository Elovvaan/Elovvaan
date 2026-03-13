import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-700">Swipe2Win</Link>
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Link to="/dashboard" className="text-slate-600">Dashboard</Link>
          <Link to="/notifications" className="text-slate-600">Notifications</Link>
          {user ? (
            <button onClick={logout} className="rounded-lg border px-3 py-1">Logout</button>
          ) : (
            <Link to="/login" className="rounded-lg bg-brand-600 px-3 py-1 text-white">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};
