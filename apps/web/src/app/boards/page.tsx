import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Board = {
  id: string;
  title: string;
  entryFee: string;
  prizePool: string;
  spotCount: number;
  filledSpots: number;
  category: { name: string };
};

async function getBoards(): Promise<Board[]> {
  const response = await fetch(`${API_URL}/boards`, { cache: 'no-store' });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export default async function BoardsPage() {
  const boards = await getBoards();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Prize Boards</h1>
      <div className="space-y-3">
        {boards.map((board) => (
          <Link key={board.id} href={`/boards/${board.id}`} className="block rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="font-semibold">{board.title}</h2>
            <p className="text-sm text-slate-400">
              {board.category?.name ?? 'General'} • Entry ${board.entryFee} • Pool ${board.prizePool}
            </p>
            <p className="text-xs text-slate-500">
              Spots {board.filledSpots}/{board.spotCount}
            </p>
          </Link>
        ))}
      </div>
      {boards.length === 0 && <p className="text-sm text-slate-400">No boards available. Start the API + seed data first.</p>}
    </div>
  );
}
