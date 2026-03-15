'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swipe2WinLogo } from './Swipe2WinLogo';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/boards', label: 'Boards' },
  { href: '/boards/create', label: 'Create Board' },
  { href: '/winners', label: 'Winners' },
  { href: '/notifications', label: 'Notifications' }
];

export function Sidebar() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside className="w-64 border-r border-brand-100 bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-700"><Swipe2WinLogo className="h-7 w-7" />Swipe2Win Admin</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded px-3 py-2 hover:bg-brand-50">
            {link.label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="mt-8 rounded bg-brand-600 px-3 py-2 text-white" type="button">Logout</button>
    </aside>
  );
}
