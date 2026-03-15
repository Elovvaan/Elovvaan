import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Swipe2WinLogo } from './Swipe2WinLogo';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <Swipe2WinLogo className="h-7 w-7" />
          Swipe2Win
        </Link>
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Link to="/dashboard" className="text-slate-600">Dashboard</Link>
          <Link to="/notifications" className="text-slate-600">Notifications</Link>
          {user ? (
            <button onClick={logout} className="rounded-lg border border-brand-200 px-3 py-1">Logout</button>
          ) : (
            <Link to="/login" className="rounded-lg bg-brand-600 px-3 py-1 text-white">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};
