'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home' },
  { href: '/arena', label: 'Arena' },
  { href: '/boards', label: 'Boards' },
  { href: '/create', label: 'Create' },
  { href: '/profile', label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-md justify-between border-t border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={pathname === item.href ? 'text-cyan-400' : ''}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
