'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <aside className="w-64 border-r bg-white p-4">
      <h2 className="mb-4 text-lg font-bold">Swipe2Win Admin</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded px-3 py-2 hover:bg-slate-100">
            {link.label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="mt-8 rounded bg-slate-900 px-3 py-2 text-white" type="button">Logout</button>
    </aside>
  );
}
