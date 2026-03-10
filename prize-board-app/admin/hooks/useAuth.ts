'use client';

import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me').then((res) => (res.ok ? res.json() : null)).then(setUser);
  }, []);

  return user;
}
