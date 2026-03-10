import { NextResponse } from 'next/server';
import { apiRequest } from '@/lib/server-api';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const res = await apiRequest(`/admin/boards/${params.id}/entries`);
  return NextResponse.json(await res.json());
}
