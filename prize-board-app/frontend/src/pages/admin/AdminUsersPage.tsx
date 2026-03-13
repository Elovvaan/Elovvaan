import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { userService } from '../../services/userService';
import type { User } from '../../types';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    userService.listUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <PageShell title="Admin Users" subtitle="Customer account overview">
      <Card>
        <ul className="space-y-2 text-sm">
          {users.map((user) => <li key={user.id}>{user.name} · {user.email} · XP {user.xp}</li>)}
        </ul>
      </Card>
    </PageShell>
  );
};
