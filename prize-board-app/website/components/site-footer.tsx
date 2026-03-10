import Link from 'next/link';

const legalLinks = [
  { href: '/legal/tos', label: 'Terms of Service' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/sweepstakes-rules', label: 'Sweepstakes Rules' },
  { href: '/legal/amoe', label: 'AMOE' }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Swipe2Win. Play fairly. Win boldly.</p>
        <ul className="flex flex-wrap gap-4">
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-brand-700">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
