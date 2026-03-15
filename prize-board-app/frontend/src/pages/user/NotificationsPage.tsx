import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { realtimeService } from '../../services/realtimeService';
import { userService } from '../../services/userService';
import type { UserNotification } from '../../types';

export const NotificationsPage = () => {
  const [items, setItems] = useState<UserNotification[]>([]);

  useEffect(() => {
    userService.notifications().then(setItems).catch(() => setItems([{ type: 'system', message: 'No notifications available right now.' }]));

    const pollNotifications = async () => {
      const next = await userService.notifications();
      setItems(next);
      if (next[0]) realtimeService.pushNotification(next[0]);
    };

    const timer = window.setInterval(() => {
      void pollNotifications();
    }, 10000);

    const removeListener = realtimeService.on('push_notification', (event: UserNotification) => {
      setItems((current) => [event, ...current.filter((item) => item.id !== event.id)]);
    });

    return () => {
      removeListener();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <PageShell title="Notifications" subtitle="Stay up to date with board activity">
      <Card>
        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li key={item.id ?? `${item.type}-${index}`} className="rounded-lg border border-brand-100 bg-brand-50/60 p-2">
              <p className="font-medium text-brand-700">{item.type.replace(/_/g, ' ')}</p>
              <p>{item.message}</p>
            </li>
          ))}
        </ul>
      </Card>
    </PageShell>
  );
};
