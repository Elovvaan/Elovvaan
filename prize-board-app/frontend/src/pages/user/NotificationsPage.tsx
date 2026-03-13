import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { userService } from '../../services/userService';

export const NotificationsPage = () => {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    userService.notifications().then(setItems).catch(() => setItems(['No notifications available right now.']));
  }, []);

  return (
    <PageShell title="Notifications" subtitle="Stay up to date with board activity">
      <Card>
        <ul className="space-y-2 text-sm">
          {items.map((item) => <li key={item} className="rounded-lg bg-slate-50 p-2">{item}</li>)}
        </ul>
      </Card>
    </PageShell>
  );
};
