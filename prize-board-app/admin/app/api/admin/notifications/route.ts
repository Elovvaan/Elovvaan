import { NextResponse } from 'next/server';
import { apiRequest } from '@/lib/server-api';

export async function GET() {
  const res = await apiRequest('/admin/notifications');
  return NextResponse.json(await res.json());
}
