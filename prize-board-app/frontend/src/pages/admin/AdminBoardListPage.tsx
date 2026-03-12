import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { boardService } from '../../services/boardService';
import type { Board } from '../../types';

export const AdminBoardListPage = () => {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    boardService.getAdminBoards().then(setBoards);
  }, []);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Boards</h1>
        <Link to="/admin/boards/new"><Button>Create board</Button></Link>
      </div>
      <ul className="space-y-2">{boards.map((b) => <li key={b.id}><Link to={`/admin/boards/${b.id}`} className="text-brand-500">{b.title}</Link></li>)}</ul>
    </Card>
  );
};
