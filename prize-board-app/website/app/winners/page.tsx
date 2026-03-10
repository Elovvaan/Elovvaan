import { PageHero } from '@/components/page-hero';

const winners = [
  { name: 'J. Ramirez', prize: '$2,500 Cash', board: 'City Clash Board' },
  { name: 'A. Chen', prize: 'iPhone 15 Pro', board: 'Elite Board' },
  { name: 'M. Lewis', prize: '$500 Gift Card', board: 'Rookie Board' }
];

export default function WinnersPage() {
  return (
    <div>
      <PageHero title="Recent Winners" subtitle="Real players. Real prizes. Updated every draw cycle." />
      <div className="grid gap-4 md:grid-cols-3">
        {winners.map((winner) => (
          <article key={winner.name} className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-brand-700">{winner.name}</h2>
            <p className="mt-2 text-slate-700">{winner.prize}</p>
            <p className="text-sm text-slate-500">{winner.board}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
