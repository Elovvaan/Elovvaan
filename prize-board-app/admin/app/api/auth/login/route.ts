import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function POST(request: Request) {
  const body = await request.json();

  const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!loginRes.ok) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const { accessToken } = await loginRes.json();

  const meRes = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!meRes.ok) {
    return NextResponse.json({ message: 'Unable to validate user' }, { status: 401 });
  }

  const me = await meRes.json();
  if (!me?.isAdmin) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  cookies().set('admin_token', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return NextResponse.json({ ok: true });
}
