'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-4 text-sm font-medium">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/boards">Boards</Link>
      <Link href="/entries">My Entries</Link>
      <Link href="/login">Login</Link>
    </nav>
  );
}
