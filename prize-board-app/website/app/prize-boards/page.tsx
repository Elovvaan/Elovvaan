import { PageHero } from '@/components/page-hero';

export default function PrizeBoardsPage() {
  return (
    <div>
      <PageHero
        title="Prize Boards"
        subtitle="Compete in themed boards with changing rewards, seasonal bonuses, and boosted entry windows."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Rookie Board', 'Great for new players. Smaller pools, faster payouts.'],
          ['City Clash Board', 'Compete by location and represent your city every week.'],
          ['Elite Board', 'High XP requirement, high-value rewards, premium drops.']
        ].map(([name, desc]) => (
          <div key={name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-700">{name}</h2>
            <p className="mt-2 text-slate-600">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
