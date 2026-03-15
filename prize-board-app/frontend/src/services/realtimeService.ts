import type { Board, UserNotification } from '../types';

const emitter = new EventTarget();
let boardPollHandle: number | null = null;

const emit = <T>(name: string, detail: T) => {
  emitter.dispatchEvent(new CustomEvent(name, { detail }));
};

export const realtimeService = {
  on<T>(name: string, listener: (payload: T) => void) {
    const handler = (event: Event) => listener((event as CustomEvent<T>).detail);
    emitter.addEventListener(name, handler);
    return () => emitter.removeEventListener(name, handler);
  },

  startBoardEventFeed(fetchBoards: () => Promise<Board[]>, intervalMs = 5000) {
    if (boardPollHandle) return;

    let previousBoards = new Map<string, Board>();

    const tick = async () => {
      const boards = await fetchBoards();
      const nextBoards = new Map(boards.map((board) => [board.id, board]));

      boards.forEach((board) => {
        const previous = previousBoards.get(board.id);
        if (!previous) {
          emit('board_update', board);
          return;
        }

        if (board.soldSpots !== previous.soldSpots) {
          emit('board_progress', board);
          emit('board_fill_update', board);
        }

        if (previous.soldSpots < previous.totalSpots && board.soldSpots >= board.totalSpots) {
          emit('board_full', { boardId: board.id });
        }

        if (!previous.winnerId && board.winnerId) {
          emit('winner_selected', { boardId: board.id, winnerId: board.winnerId });
        }
      });

      previousBoards = nextBoards;
    };

    void tick();
    boardPollHandle = window.setInterval(() => {
      void tick();
    }, intervalMs);
  },

  pushNotification(notification: UserNotification) {
    emit('push_notification', notification);
  }
};
