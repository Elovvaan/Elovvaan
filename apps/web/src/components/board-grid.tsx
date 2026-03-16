'use client';

import { BoardCell } from '@/lib/api';

export function BoardGrid({ cells, onSelect, selected }: { cells: BoardCell[]; onSelect: (n: number) => void; selected?: number }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
      {cells.map((cell) => (
        <button
          key={cell.id}
          disabled={cell.isClaimed}
          onClick={() => onSelect(cell.cellNumber)}
          className={`rounded border p-2 text-xs ${
            cell.isClaimed
              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
              : selected === cell.cellNumber
                ? 'border-blue-600 bg-blue-100'
                : 'bg-white hover:bg-blue-50'
          }`}
        >
          #{cell.cellNumber}
        </button>
      ))}
    </div>
  );
}
