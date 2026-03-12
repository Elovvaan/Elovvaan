import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { boardService } from '../../services/boardService';
import { paymentService } from '../../services/paymentService';
import type { Board } from '../../types';

export const BoardDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    boardService.getBoard(id).then(setBoard).catch(() => setBoard(null));
  }, [id]);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await paymentService.createIntent({ boardId: id, quantity: qty });
      navigate(`/payment-confirmation?paymentId=${res.paymentId}&clientSecret=${res.clientSecret}`);
    } finally {
      setLoading(false);
    }
  };

  if (!board) return <p className="text-slate-300">Board not found.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <img src={board.prizeImage} alt={board.title} className="w-full rounded-2xl object-cover" />
      <Card>
        <h1 className="text-2xl font-bold">{board.title}</h1>
        <p className="mt-3 text-slate-300">{board.description}</p>
        <p className="mt-4 text-brand-500">${board.pricePerEntry.toFixed(2)} per entry</p>
        <p className="text-sm text-slate-400">{board.totalEntries} total entries</p>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          />
          <Button onClick={handleBuy} disabled={loading}>
            {loading ? 'Creating payment...' : 'Buy entries'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
