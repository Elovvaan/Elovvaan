import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { boardService } from '../../services/boardService';
import type { Board } from '../../types';

export const AdminBoardDetailPage = () => {
  const { boardId = '' } = useParams();
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    boardService.getBoard(boardId).then(setBoard).catch(() => setBoard(null));
  }, [boardId]);

  return (
    <PageShell title="Board Detail" subtitle="Operational metadata">
      <Card>
        <pre className="overflow-auto text-xs">{JSON.stringify(board, null, 2)}</pre>
      </Card>
    </PageShell>
  );
};
