import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { useAuth } from '../../hooks/useAuth';
import { realtimeService } from '../../services/realtimeService';
import { userService } from '../../services/userService';
import type { WalletLedger } from '../../types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [winnerMessage, setWinnerMessage] = useState('');
  const [ledger, setLedger] = useState<WalletLedger>({ balanceCents: 0, transactions: [] });

  useEffect(() => {
    userService.walletLedger().then(setLedger).catch(() => setLedger({ balanceCents: 0, transactions: [] }));

    const removeWinnerListener = realtimeService.on('winner_selected', (event: { winnerId?: string; boardId?: string }) => {
      if (event.winnerId && user?.id && event.winnerId === user.id) {
        setWinnerMessage(`You won board ${event.boardId ?? ''}! Claim your prize.`.trim());
      }
    });

    return () => {
      removeWinnerListener();
    };
  }, [user?.id]);

  return (
    <PageShell title="Dashboard" subtitle="Your entries, wins and XP">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-xs text-slate-500">Entries</p><p className="text-2xl font-bold">{user?.entries ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">Wins</p><p className="text-2xl font-bold">{user?.wins ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">XP</p><p className="text-2xl font-bold">{user?.xp ?? 0}</p></Card>
      </div>

      {winnerMessage ? <Card className="mt-4 border border-amber-300 bg-amber-50 text-amber-900">{winnerMessage}</Card> : null}

      <Card className="mt-4">
        <h3 className="text-sm font-semibold text-slate-700">Wallet Ledger</h3>
        <p className="mt-1 text-sm">Balance: <strong>${(ledger.balanceCents / 100).toFixed(2)}</strong></p>
        <ul className="mt-3 space-y-2 text-xs">
          {ledger.transactions.map((txn) => (
            <li key={txn.id} className="rounded-md border border-slate-200 p-2">
              <span className="font-semibold">{txn.type}</span> · ${(txn.amountCents / 100).toFixed(2)} · {txn.reason}
            </li>
          ))}
          {!ledger.transactions.length ? <li className="text-slate-500">No wallet transactions yet.</li> : null}
        </ul>
      </Card>
    </PageShell>
  );
};
