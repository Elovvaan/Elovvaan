import { Link } from 'react-router-dom';
import type { Board } from '../types';
import { Card } from './Card';

export const BoardCard = ({ board }: { board: Board }) => (
  <Card>
    <img src={board.prizeImage} alt={board.title} className="h-44 w-full rounded-xl object-cover" />
    <h3 className="mt-3 text-lg font-semibold text-white">{board.title}</h3>
    <p className="mt-1 line-clamp-2 text-sm text-slate-300">{board.description}</p>
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-brand-500">${board.pricePerEntry.toFixed(2)} / entry</span>
      <span className="text-slate-400">{board.totalEntries} spots</span>
    </div>
    <Link to={`/boards/${board.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-500 hover:text-brand-400">
      View board →
    </Link>
  </Card>
);
