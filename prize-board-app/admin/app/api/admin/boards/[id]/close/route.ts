import { NextResponse } from 'next/server';
import { apiRequest } from '@/lib/server-api';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const res = await apiRequest(`/admin/boards/${params.id}/close`, { method: 'PATCH' });
  return NextResponse.json(await res.json());
}
