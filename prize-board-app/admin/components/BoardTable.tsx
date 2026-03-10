'use client';

import Link from 'next/link';
import { Board } from '@/services/types';

export function BoardTable({ boards, onClose }: { boards: Board[]; onClose: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Status</th>
            <th className="p-3">Entries</th>
            <th className="p-3">Price</th>
            <th className="p-3">Created</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((board) => (
            <tr key={board.id} className="border-t">
              <td className="p-3 font-medium">{board.title}</td>
              <td className="p-3">{board.status}</td>
              <td className="p-3">{board.currentEntries} / {board.maxEntries}</td>
              <td className="p-3">${Number(board.pricePerEntry).toFixed(2)}</td>
              <td className="p-3">{new Date(board.createdAt).toLocaleString()}</td>
              <td className="space-x-3 p-3">
                <Link className="text-indigo-700" href={`/boards/${board.id}`}>Entries</Link>
                <Link className="text-emerald-700" href={`/boards/${board.id}`}>Winner</Link>
                <button onClick={() => onClose(board.id)} className="text-rose-700" type="button">Close</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
