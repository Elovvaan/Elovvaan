import { NextResponse } from 'next/server';
import { apiRequest } from '@/lib/server-api';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const res = await apiRequest(`/boards/${params.id}/winner`);
  return NextResponse.json(await res.json());
}
