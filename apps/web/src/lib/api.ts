const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type BoardCell = { id: string; cellNumber: number; isClaimed: boolean; userId: string | null };
export type Board = {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  pricePerEntry: string;
  totalCells: number;
  filledCells: number;
  cells?: BoardCell[];
};

export async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
