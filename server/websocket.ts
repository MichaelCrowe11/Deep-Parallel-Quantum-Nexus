import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import logger, { LogLevel } from './logger';

interface ClientMessage {
  type: string;
  data?: any;
  sessionId?: string;
  initialState?: any;
}

interface ClientSession {
  ws: WebSocket;
  state: any;
  lastActivity: number;
}

// Track active visualization sessions
const sessions = new Map<string, ClientSession>();

export function initializeWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  logger.info('WebSocket server initialized');

  wss.on('connection', (ws) => {
    logger.info('WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as ClientMessage;

        switch (message.type) {
          case 'visualization_start':
            const sessionId = crypto.randomUUID();
            sessions.set(sessionId, { 
              ws, 
              state: message.initialState || {},
              lastActivity: Date.now()
            });
            ws.send(JSON.stringify({ type: 'session_created', sessionId }));
            logger.info('Visualization session created', { sessionId });
            break;

          case 'thought_update':
            // Broadcast thought updates to all connected clients
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'thought_updated',
                  data: message.data
                }));
              }
            });
            logger.info('Thought update broadcast', { 
              recipients: wss.clients.size 
            });
            break;

          case 'session_update':
            if (message.sessionId && sessions.has(message.sessionId)) {
              const session = sessions.get(message.sessionId)!;
              session.state = { ...session.state, ...message.data };
              session.lastActivity = Date.now();
              ws.send(JSON.stringify({ 
                type: 'session_updated', 
                sessionId: message.sessionId,
                timestamp: Date.now()
              }));
              logger.info('Session updated', { sessionId: message.sessionId });
            } else {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Invalid session ID' 
              }));
              logger.warning('Invalid session ID', { sessionId: message.sessionId });
            }
            break;

          case 'pipeline_request':
            // Handle pipeline request
            break;

          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
            break;

          default:
            logger.warning('Unknown WebSocket message type', { type: message.type });
        }
      } catch (error) {
        logger.error('Error processing WebSocket message', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Error processing message' 
        }));
      }
    });

    ws.on('close', () => {
      logger.info('WebSocket client disconnected');

      // Clean up any sessions associated with this connection
      for (const [sessionId, session] of [...sessions.entries()]) {
        if (session.ws === ws) {
          sessions.delete(sessionId);
          logger.info('Session removed', { sessionId });
        }
      }
    });
  });

  // Session cleanup interval
  setInterval(() => {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of [...sessions.entries()]) {
      if (now - session.lastActivity > timeout) {
        sessions.delete(sessionId);
        logger.info('Session expired', { sessionId });
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  return wss;
}

export function broadcastToAll(wss: WebSocketServer, message: any) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

export function sendToClient(client: WebSocket, message: any) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  } else {
    logger.warning('Client not available');
  }
}