import { NextResponse } from 'next/server';
import { apiRequest } from '@/lib/server-api';

export async function GET() {
  const res = await apiRequest('/boards');
  return NextResponse.json(await res.json());
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await apiRequest('/boards', { method: 'POST', body: JSON.stringify(body) });
  return NextResponse.json(await res.json());
}
