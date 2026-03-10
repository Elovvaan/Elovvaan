export type Board = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'FULL' | 'CLOSED';
  currentEntries: number;
  maxEntries: number;
  pricePerEntry: number;
  createdAt: string;
};

export type Entry = {
  id: string;
  userId: string;
  paymentId: string;
  createdAt: string;
};

export type Winner = {
  id: string;
  boardId: string;
  userId: string;
  entryId: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
};
