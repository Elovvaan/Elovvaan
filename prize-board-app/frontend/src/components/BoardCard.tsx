import { Link } from 'react-router-dom';
import type { Board } from '../types';
import { Card } from './Card';

export const BoardCard = ({ board }: { board: Board }) => (
  <Card>
    <p className="text-xs uppercase tracking-wide text-brand-600">Prize Board</p>
    <h3 className="mt-1 text-lg font-semibold">{board.title}</h3>
    <p className="mt-1 text-sm text-slate-500">{board.prize}</p>
    <p className="mt-2 text-sm">${board.entryPrice} / entry</p>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs text-slate-500">{board.soldSpots}/{board.totalSpots} sold</span>
      <Link to={`/boards/${board.id}`} className="text-sm font-semibold text-brand-700">View</Link>
    </div>
  </Card>
);
