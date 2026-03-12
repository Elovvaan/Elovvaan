import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-white">
          Swipe<span className="text-brand-500">2Win</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link to="/boards" className="hover:text-white">
            Boards
          </Link>
          <Link to="/terms" className="hover:text-white">
            Terms
          </Link>
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin/boards' : '/dashboard'} className="hover:text-white">
                Dashboard
              </Link>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-white">
                Login
              </Link>
              <Link to="/signup" className="hover:text-white">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
