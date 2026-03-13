import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <PageShell title="Dashboard" subtitle="Your entries, wins and XP">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-xs text-slate-500">Entries</p><p className="text-2xl font-bold">{user?.entries ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">Wins</p><p className="text-2xl font-bold">{user?.wins ?? 0}</p></Card>
        <Card><p className="text-xs text-slate-500">XP</p><p className="text-2xl font-bold">{user?.xp ?? 0}</p></Card>
      </div>
    </PageShell>
  );
};
