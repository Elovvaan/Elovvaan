import { SwipeCard } from '@/components/swipe-card';

const cards = [
  { title: 'Night Clash Prize Board', subtitle: '18 spots • $10 entry • $180 pool', cta: 'Prize Board' },
  { title: '1v1 Aim Duel', subtitle: 'Public VS • $12 entry • Fast match', cta: 'VS Challenge' },
  { title: 'Creator Battle: Saturday Rush', subtitle: 'Featured arena event', cta: 'Featured Battle' },
];

export default function HomePage() {
  return (
    <div className="space-y-4">
      <header className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Swipe2Win</h1>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">$250.00</span>
        </div>
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Search boards, arenas, challenges" />
      </header>
      {cards.map((card) => (
        <SwipeCard key={card.title} {...card} />
      ))}
    </div>
  );
}
