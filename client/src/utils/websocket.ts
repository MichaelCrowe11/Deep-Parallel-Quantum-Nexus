
import { useEffect, useState, useCallback } from 'react';

// WebSocket connection status types
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Custom hook for managing WebSocket connections
export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [messages, setMessages] = useState<any[]>([]);

  // Initialize connection
  useEffect(() => {
    const newSocket = new WebSocket(url);
    
    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setStatus('disconnected');
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (status !== 'connected') {
          console.log('Attempting to reconnect...');
          setStatus('connecting');
        }
      }, 3000);
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    setSocket(newSocket);
    setStatus('connecting');
    
    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, [url]);
  
  // Send message function
  const sendMessage = useCallback((data: any) => {
    if (socket && status === 'connected') {
      socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, [socket, status]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  return { status, messages, sendMessage, clearMessages };
}

// Helper function to get WebSocket URL based on current environment
export function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/ws`;
}
