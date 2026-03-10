import { NextResponse } from 'next/server';
import { apiRequest } from '@/lib/server-api';

export async function GET() {
  try {
    const res = await apiRequest('/me');
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
