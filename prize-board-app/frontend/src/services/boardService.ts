import { api } from './api';
import type { Board } from '../types';

export const boardService = {
  listBoards: async () => {
    const { data } = await api.get<Board[]>('/boards');
    return data;
  },
  getBoard: async (id: string) => {
    const { data } = await api.get<Board>(`/boards/${id}`);
    return data;
  },
  createBoard: async (payload: Partial<Board>) => {
    const { data } = await api.post<Board>('/admin/boards', payload);
    return data;
  },
};
