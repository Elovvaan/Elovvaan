export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  xp: number;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  prizeImage: string;
  pricePerEntry: number;
  totalEntries: number;
  active: boolean;
}

export interface Entry {
  id: string;
  boardId: string;
  boardTitle: string;
  quantity: number;
  createdAt: string;
}

export interface Win {
  id: string;
  boardTitle: string;
  prize: string;
  wonAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
