import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { userService } from '../../services/userService';
import type { User } from '../../types';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    userService.listUsers().then(setUsers);
  }, []);

  return (
    <Card>
      <h1 className="text-2xl font-bold">Users</h1>
      <ul className="mt-3 space-y-2 text-sm">{users.map((u) => <li key={u.id}>{u.name} · {u.email} · XP {u.xp}</li>)}</ul>
    </Card>
  );
};
