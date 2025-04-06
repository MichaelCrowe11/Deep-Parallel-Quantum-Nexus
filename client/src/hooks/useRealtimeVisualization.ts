
import { useEffect, useRef } from 'react';
import { create } from '@react-three/fiber';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeVisualization(thoughtId: number) {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    ws.current = new WebSocket(`ws://${window.location.host}/ws`);
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'thought_updated' && data.data.id === thoughtId) {
        queryClient.invalidateQueries(['thoughts', thoughtId]);
      }
    };

    return () => ws.current?.close();
  }, [thoughtId]);

  return {
    sendUpdate: (data: any) => {
      ws.current?.send(JSON.stringify({
        type: 'thought_update',
        data
      }));
    }
  };
}
