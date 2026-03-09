import Link from 'next/link';

const boards = [
  { id: 'luxury-vacation', title: 'Luxury Vacation Raffle', status: 'LIVE', spots: '84 / 100' },
  { id: 'gaming-setup', title: 'Gaming Setup Giveaway', status: 'FULL', spots: '50 / 50' },
  { id: 'dream-car', title: 'Dream Car Sprint', status: 'UPCOMING', spots: '0 / 500' }
];

export default function BoardsPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Board Management</h1>
        <Link href="/boards/create" className="rounded bg-indigo-600 px-4 py-2 text-white">Create Board</Link>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Board</th>
              <th className="p-3">Status</th>
              <th className="p-3">Entries</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boards.map((board) => (
              <tr key={board.id} className="border-t">
                <td className="p-3 font-medium">{board.title}</td>
                <td className="p-3">{board.status}</td>
                <td className="p-3">{board.spots}</td>
                <td className="p-3"><Link className="text-indigo-700" href={`/boards/${board.id}`}>View details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
