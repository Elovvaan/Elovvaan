import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { boardService } from '../../services/boardService';

export const AdminBoardCreatePage = () => {
  const [title, setTitle] = useState('');
  const [prize, setPrize] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const board = await boardService.createBoard({
      title,
      prize,
      description: 'New board',
      entryPrice: 5,
      totalSpots: 100,
      soldSpots: 0,
      closesAt: new Date().toISOString(),
    });
    navigate(`/admin/boards/${board.id}`);
  };

  return (
    <PageShell title="Create Board" subtitle="Launch a new competition board">
      <Card>
        <form className="space-y-3" onSubmit={handleCreate}>
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Board title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Prize" value={prize} onChange={(e) => setPrize(e.target.value)} />
          <Button type="submit">Create</Button>
        </form>
      </Card>
    </PageShell>
  );
};
