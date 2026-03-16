import Link from 'next/link';

const boards = [
  { id: 'night-clash', title: 'Night Clash Prize Board', fee: '$10', pool: '$180', spots: '12/18' },
  { id: 'weekend-sports', title: 'Weekend Sports Ladder', fee: '$15', pool: '$300', spots: '9/20' },
];

export default function BoardsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Prize Boards</h1>
      <div className="flex gap-2 text-xs">
        {['All', 'FPS', 'Sports', 'High Prize'].map((f) => <button key={f} className="rounded-full border border-slate-700 px-3 py-1">{f}</button>)}
      </div>
      <div className="space-y-3">
        {boards.map((board) => (
          <Link key={board.id} href={`/boards/${board.id}`} className="block rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="font-semibold">{board.title}</h2>
            <p className="text-sm text-slate-400">Entry {board.fee} • Pool {board.pool} • Spots {board.spots}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
