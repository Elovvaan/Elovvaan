'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Notification } from '@/services/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch('/api/admin/notifications').then((res) => res.json()).then(setNotifications);
  }, []);

  return (
    <Layout>
      <h1 className="mb-4 text-2xl font-bold">Notifications</h1>
      <div className="rounded-lg bg-white p-4 shadow">
        <ul className="space-y-2 text-sm">
          {notifications.map((item) => (
            <li key={item.id} className="rounded border p-3">
              User: {item.userId} • {item.message} • {new Date(item.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
