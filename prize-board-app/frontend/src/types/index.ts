export type Role = 'guest' | 'user' | 'admin';

export interface Board {
  id: string;
  title: string;
  prize: string;
  description: string;
  entryPrice: number;
  totalSpots: number;
  soldSpots: number;
  closesAt: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  wins: number;
  entries: number;
  role: Exclude<Role, 'guest'>;
}
