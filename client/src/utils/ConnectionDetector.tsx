import React, { createContext, useContext, useEffect, useState } from 'react';

// Connection status types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'fallback' | 'error';

// Connection mode types
export type ConnectionMode = 'websocket' | 'http' | 'none';

// Configuration from the server
interface ServerConfig {
  wsUrl: string;
  httpUrl: string;
  apiVersion: string;
}

// Connection context state
interface ConnectionContextState {
  status: ConnectionStatus;
  mode: ConnectionMode;
  wsUrl: string | null;
  httpUrl: string | null;
  isConnected: boolean;
  lastError: Error | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (type: string, message: any) => Promise<boolean>;
}

// Default context state
const defaultState: ConnectionContextState = {
  status: 'disconnected',
  mode: 'none',
  wsUrl: null,
  httpUrl: null,
  isConnected: false,
  lastError: null,
  connect: () => {},
  disconnect: () => {},
  sendMessage: async () => false,
};

// Create context
const ConnectionContext = createContext<ConnectionContextState>(defaultState);

// WebSocket state
let webSocket: WebSocket | null = null;
let messageQueue: {type: string; message: any}[] = [];
let clientId: string | null = null;

// Hook for components to use the connection context
export const useConnection = () => useContext(ConnectionContext);

// Detect WebSocket support
const supportsWebSockets = () => {
  return typeof WebSocket !== 'undefined';
};

// Generate a unique client ID
const generateClientId = () => {
  return 'client-' + Math.random().toString(36).substring(2, 15);
};

// Fetch server configuration
const fetchServerConfig = async (): Promise<ServerConfig> => {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Failed to fetch server config: ${response.status}`);
    }
    const data = await response.json();
    return {
      wsUrl: data.wsUrl,
      httpUrl: data.httpUrl || '/api/fallback',
      apiVersion: data.apiVersion || '1.0'
    };
  } catch (error) {
    console.error('Error fetching server config:', error);
    // Default fallback configuration
    return {
      wsUrl: location.protocol === 'https:' ? 
        `wss://${location.host}/ws` : 
        `ws://${location.host}/ws`,
      httpUrl: '/api/fallback',
      apiVersion: '1.0'
    };
  }
};

// Provider component
export const ConnectionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [mode, setMode] = useState<ConnectionMode>('none');
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [httpUrl, setHttpUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(0);
  const [isPendingReconnect, setIsPendingReconnect] = useState(false);
  
  // Initialize connection
  useEffect(() => {
    const initialize = async () => {
      try {
        // Generate client ID if not already set
        if (!clientId) {
          clientId = generateClientId();
          console.log(`Generated client ID: ${clientId}`);
        }
        
        // Fetch server config
        const config = await fetchServerConfig();
        console.log('Server config:', config);
        
        // Set URLs
        setWsUrl(config.wsUrl);
        setHttpUrl(config.httpUrl);
        
        // Auto-connect if URLs are available
        if (config.wsUrl || config.httpUrl) {
          connect();
        }
      } catch (error) {
        console.error('Failed to initialize connection:', error);
        setLastError(error instanceof Error ? error : new Error('Failed to initialize'));
        setStatus('error');
      }
    };
    
    initialize();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);
  
  // Connect to the server
  const connect = async () => {
    // Reset state
    setStatus('connecting');
    setLastError(null);
    setIsPendingReconnect(false);
    
    // Try WebSocket first if supported
    if (supportsWebSockets() && wsUrl) {
      try {
        console.log(`Connecting to WebSocket: ${wsUrl}`);
        webSocket = new WebSocket(wsUrl);
        
        webSocket.onopen = () => {
          console.log('WebSocket connection established');
          setStatus('connected');
          setMode('websocket');
          setIsConnected(true);
          
          // Send any queued messages
          if (messageQueue.length > 0) {
            console.log(`Sending ${messageQueue.length} queued messages`);
            messageQueue.forEach(({ type, message }) => {
              sendWebSocketMessage(type, message);
            });
            messageQueue = [];
          }
        };
        
        webSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            
            // Store client ID from welcome message
            if (data.type === 'welcome' && data.clientId) {
              clientId = data.clientId;
              console.log(`Using server-assigned client ID: ${clientId}`);
            }
            
            // Process message here or dispatch to handlers
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
        
        webSocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setLastError(new Error('WebSocket connection error'));
          
          // Only switch to fallback if not already in fallback mode
          if (mode !== 'http') {
            console.log('Switching to HTTP fallback mode');
            connectHttpFallback();
          }
        };
        
        webSocket.onclose = () => {
          console.log('WebSocket connection closed');
          setIsConnected(webSocket !== null);
          
          // Only attempt reconnect if not already reconnecting
          if (!isPendingReconnect && mode === 'websocket') {
            setIsPendingReconnect(true);
            console.log('Scheduling WebSocket reconnection');
            setTimeout(() => {
              if (mode === 'websocket') {
                console.log('Attempting WebSocket reconnection');
                connect();
              }
            }, 2000);
          }
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setLastError(error instanceof Error ? error : new Error('WebSocket connection failed'));
        
        // Fall back to HTTP
        connectHttpFallback();
      }
    } else {
      // WebSocket not supported or URL not available, use HTTP fallback
      connectHttpFallback();
    }
  };
  
  // Connect using HTTP fallback
  const connectHttpFallback = async () => {
    if (!httpUrl) {
      setStatus('error');
      setLastError(new Error('No HTTP fallback URL available'));
      return;
    }
    
    try {
      console.log(`Using HTTP fallback mode with URL: ${httpUrl}`);
      
      // Check if the HTTP fallback endpoint is available
      const response = await fetch(`${httpUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP fallback health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('HTTP fallback health check:', data);
      
      // Set connection status
      setStatus('fallback');
      setMode('http');
      setIsConnected(true);
      
      // Start polling for messages
      startPolling();
      
      // Send any queued messages via HTTP
      if (messageQueue.length > 0) {
        console.log(`Sending ${messageQueue.length} queued messages via HTTP`);
        const sendPromises = messageQueue.map(({ type, message }) => 
          sendHttpMessage(type, message)
        );
        await Promise.all(sendPromises);
        messageQueue = [];
      }
    } catch (error) {
      console.error('Failed to establish HTTP fallback connection:', error);
      setStatus('error');
      setLastError(error instanceof Error ? error : new Error('HTTP fallback failed'));
      setIsConnected(false);
    }
  };
  
  // Start polling for messages (HTTP fallback)
  const startPolling = () => {
    const poll = async () => {
      if (mode !== 'http' || !isConnected || !httpUrl || !clientId) {
        return;
      }
      
      try {
        const response = await fetch(`${httpUrl}/poll?clientId=${clientId}&since=${lastPollTime}`);
        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status}`);
        }
        
        const data = await response.json();
        setLastPollTime(data.timestamp);
        
        // Process any received messages
        if (data.messages && data.messages.length > 0) {
          console.log(`Received ${data.messages.length} messages from polling`);
          data.messages.forEach((message: any) => {
            // Process message here or dispatch to handlers
            console.log('Received message via polling:', message);
          });
        }
        
        // Schedule next poll
        const nextPollDelay = data.nextPoll ? 
          Math.max(0, data.nextPoll - Date.now()) : 
          1000;
        
        setTimeout(poll, nextPollDelay);
      } catch (error) {
        console.error('Error polling for messages:', error);
        setTimeout(poll, 2000); // Retry after delay
      }
    };
    
    // Start polling immediately
    poll();
  };
  
  // Disconnect from the server
  const disconnect = () => {
    setIsConnected(false);
    setStatus('disconnected');
    
    // Close WebSocket if open
    if (webSocket) {
      try {
        webSocket.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      webSocket = null;
    }
    
    // Stop polling (handled by mode change)
    setMode('none');
  };
  
  // Send a message via WebSocket
  const sendWebSocketMessage = (type: string, message: any): boolean => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send WebSocket message - connection not open');
      messageQueue.push({ type, message });
      return false;
    }
    
    try {
      const payload = JSON.stringify({
        type,
        message,
        clientId,
        timestamp: Date.now()
      });
      
      webSocket.send(payload);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      messageQueue.push({ type, message });
      return false;
    }
  };
  
  // Send a message via HTTP
  const sendHttpMessage = async (type: string, message: any): Promise<boolean> => {
    if (!httpUrl || !clientId) {
      console.warn('Cannot send HTTP message - missing URL or client ID');
      messageQueue.push({ type, message });
      return false;
    }
    
    try {
      const response = await fetch(`${httpUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          message,
          clientId,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send HTTP message: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('HTTP message sent, response:', data);
      return true;
    } catch (error) {
      console.error('Error sending HTTP message:', error);
      messageQueue.push({ type, message });
      return false;
    }
  };
  
  // Send a message using the current connection mode
  const sendMessage = async (type: string, message: any): Promise<boolean> => {
    if (!isConnected) {
      console.warn('Cannot send message - not connected');
      messageQueue.push({ type, message });
      return false;
    }
    
    if (mode === 'websocket') {
      return sendWebSocketMessage(type, message);
    } else if (mode === 'http') {
      return await sendHttpMessage(type, message);
    } else {
      console.warn('Cannot send message - no active connection mode');
      messageQueue.push({ type, message });
      return false;
    }
  };
  
  // Create context value
  const contextValue: ConnectionContextState = {
    status,
    mode,
    wsUrl,
    httpUrl,
    isConnected,
    lastError,
    connect,
    disconnect,
    sendMessage
  };
  
  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
};

// Connection status display component
export const ConnectionStatus: React.FC = () => {
  const { status, mode, isConnected } = useConnection();
  
  // Determine status text and color
  let statusText = 'Unknown';
  let statusColor = 'gray';
  
  switch (status) {
    case 'connecting':
      statusText = 'Connecting...';
      statusColor = 'blue';
      break;
    case 'connected':
      statusText = 'Connected (WebSocket)';
      statusColor = 'green';
      break;
    case 'fallback':
      statusText = 'Connected (HTTP Fallback)';
      statusColor = 'orange';
      break;
    case 'disconnected':
      statusText = 'Disconnected';
      statusColor = 'red';
      break;
    case 'error':
      statusText = 'Connection Error';
      statusColor = 'red';
      break;
  }
  
  return (
    <div className="connection-status" style={{ 
      padding: '8px', 
      borderRadius: '4px',
      backgroundColor: statusColor,
      color: 'white',
      display: 'inline-block',
      fontSize: '14px'
    }}>
      {statusText}
    </div>
  );
};

export default ConnectionProvider;