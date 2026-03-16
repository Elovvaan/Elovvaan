import { BoardJoinButton } from '@/components/board-join-button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getBoard(id: string) {
  const response = await fetch(`${API_URL}/boards/${id}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json();
}

export default async function BoardDetailPage({ params }: { params: { id: string } }) {
  const board = await getBoard(params.id);

  if (!board) {
    return <p className="text-sm text-slate-400">Board not found.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{board.title}</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        <p>{board.description ?? 'No description provided.'}</p>
        <p className="mt-2">Entry ${board.entryFee} • Pool ${board.prizePool}</p>
        <p>
          Spots {board.filledSpots}/{board.spotCount}
        </p>
      </section>
      <BoardJoinButton boardId={board.id} />
    </div>
  );
}
