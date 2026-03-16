'use client';

import { AdminNav } from '@/components/nav';
import { adminAuth } from '@/lib/auth';
import { adminFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<Array<{ id: string; email: string; role: string }>>([]);

  useEffect(() => {
    const token = adminAuth.get();
    if (!token) return;
    adminFetch('/admin/users', token).then(setUsers);
  }, []);

  return <div><AdminNav /><h1 className="mb-4 text-2xl font-semibold">Users</h1><div className="space-y-2">{users.map((user)=><div key={user.id} className="rounded border p-3">{user.email} ({user.role})</div>)}</div></div>;
}
