import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { userService } from '../../services/userService';
import type { NotificationItem } from '../../types';

export const NotificationsPage = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    userService.notifications().then(setItems);
  }, []);

  return (
    <Card>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-slate-700 p-3">
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-slate-300">{item.body}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
};
