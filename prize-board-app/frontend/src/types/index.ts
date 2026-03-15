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
  winnerId?: string;
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

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amountCents: number;
  balanceAfterCents: number;
  reason: string;
  referenceId: string;
  createdAt: string;
}

export interface WalletLedger {
  balanceCents: number;
  transactions: WalletTransaction[];
}

export interface UserNotification {
  id?: string;
  userId?: string;
  type: string;
  message: string;
  createdAt?: string;
}
