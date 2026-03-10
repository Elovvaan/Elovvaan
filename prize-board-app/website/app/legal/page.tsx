import Link from 'next/link';
import { PageHero } from '@/components/page-hero';

const links = [
  { href: '/legal/tos', label: 'Terms of Service' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/sweepstakes-rules', label: 'Sweepstakes Rules' },
  { href: '/legal/amoe', label: 'Alternative Method of Entry (AMOE)' }
];

export default function LegalIndexPage() {
  return (
    <div>
      <PageHero title="Legal" subtitle="Everything you need to review before playing Swipe2Win." />
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link className="block rounded-lg border border-slate-200 p-4 hover:bg-brand-50" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
