import { PageHero } from '@/components/page-hero';

export default function PrizeBoardsPage() {
  return (
    <div>
      <PageHero
        title="Prize Boards"
        subtitle="Compete in themed prize promotions with changing rewards, seasonal bonuses, and boosted promotion entry windows."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Rookie Promotion', 'Great for new players. Smaller prize pools and faster prize processing.'],
          ['City Clash Promotion', 'Compete by location and represent your city each week.'],
          ['Elite Promotion', 'High XP requirement, high-value rewards, and premium drops.']
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
