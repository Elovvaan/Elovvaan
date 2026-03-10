'use client';

import { useEffect, useState } from 'react';

const SOCKET_URL = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000').replace('http', 'ws');

export function useSocket(events: string[]) {
  const [feed, setFeed] = useState<{ event: string; payload: unknown; at: string }[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`${SOCKET_URL}/socket.io/?EIO=4&transport=websocket`);

    ws.onopen = () => {
      ws.send('40');
    };

    ws.onmessage = (message) => {
      const data = String(message.data);

      if (data === '2') {
        ws.send('3');
        return;
      }

      if (!data.startsWith('42')) {
        return;
      }

      try {
        const [eventName, payload] = JSON.parse(data.slice(2));
        if (!events.includes(eventName)) {
          return;
        }

        setFeed((current) => [{ event: eventName, payload, at: new Date().toISOString() }, ...current].slice(0, 20));
      } catch {
        // ignore malformed events
      }
    };

    return () => ws.close();
  }, [events]);

  return feed;
}
