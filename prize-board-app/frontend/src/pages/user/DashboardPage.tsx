import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { userService } from '../../services/userService';
import type { Entry, Win } from '../../types';

export const DashboardPage = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [wins, setWins] = useState<Win[]>([]);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    userService.dashboard().then((d) => {
      setEntries(d.entries);
      setWins(d.wins);
      setXp(d.xp);
    });
  }, []);

  return (
    <div className="space-y-4">
      <Card><h1 className="text-2xl font-bold">Your Dashboard</h1><p className="text-brand-500">XP: {xp}</p></Card>
      <Card>
        <h2 className="font-semibold">Entries</h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-300">{entries.map((e) => <li key={e.id}>{e.boardTitle} · {e.quantity}</li>)}</ul>
      </Card>
      <Card>
        <h2 className="font-semibold">Wins</h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-300">{wins.map((w) => <li key={w.id}>{w.boardTitle} · {w.prize}</li>)}</ul>
      </Card>
    </div>
  );
};
