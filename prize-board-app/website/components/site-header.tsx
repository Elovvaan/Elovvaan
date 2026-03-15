import Link from 'next/link';
import { navLinks } from './nav-links';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-brand-700">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 text-sm text-white">S2</span>
          Swipe2Win
        </Link>
        <ul className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="rounded px-3 py-2 transition hover:bg-brand-50 hover:text-brand-700">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
