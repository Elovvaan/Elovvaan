import { api } from './api';
import type { Board } from '../types';

export const boardService = {
  getActiveBoards: async () => {
    const { data } = await api.get<Board[]>('/boards/active');
    return data;
  },
  getBoard: async (id: string) => {
    const { data } = await api.get<Board>(`/boards/${id}`);
    return data;
  },
  createBoard: async (payload: Omit<Board, 'id'>) => {
    const { data } = await api.post<Board>('/admin/boards', payload);
    return data;
  },
  getAdminBoards: async () => {
    const { data } = await api.get<Board[]>('/admin/boards');
    return data;
  },
};
