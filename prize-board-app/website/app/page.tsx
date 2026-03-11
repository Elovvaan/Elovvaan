import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { ComplianceNotice } from '@/components/ComplianceNotice';

export default function HomePage() {
  return (
    <div>
      <PageHero
        title="Swipe2Win: Where every swipe can unlock a win."
        subtitle="Join live prize promotions, stack XP, and climb prestige tiers while earning promotion entries in a mobile-first sweepstakes platform."
      />
      <ComplianceNotice />
      <section className="grid gap-6 md:grid-cols-3">
        {[
          ['Instant Challenges', 'Complete daily swipe challenges and earn entries in under 60 seconds.'],
          ['Live Prize Promotions', 'Track your ranking in real time across city, regional, and national prize promotions.'],
          ['Fair & Transparent', 'Clear legal framework, no hidden odds, and player-first rules.']
        ].map(([title, desc]) => (
          <article key={title} className="rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-700">{title}</h2>
            <p className="mt-2 text-slate-600">{desc}</p>
          </article>
        ))}
      </section>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/download" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
          Download the App
        </Link>
        <Link href="/how-it-works" className="rounded-lg border border-brand-200 px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50">
          Learn How It Works
        </Link>
      </div>
    </div>
  );
}
