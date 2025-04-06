/**
 * Deep Parallel AI - HTTP Fallback Routes
 * 
 * These routes provide HTTP fallback functionality for clients
 * that cannot use WebSockets.
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger.js';

// Create a router
const router = express.Router();

// In-memory message store for HTTP fallback
const messageStore = [];
const MAX_MESSAGES = 100;

// Get server configuration (for WebSocket URL discovery)
router.get('/config', (req, res) => {
  // Get the WebSocket URL from app.locals (set in server/index.ts)
  const wsUrl = req.app.locals.wsUrl || 'ws://localhost:5000/ws';
  const serverPort = req.app.locals.serverPort || 5000;
  
  logger.info('Client requested server configuration', {
    ip: req.ip,
    wsUrl,
    serverPort
  });
  
  res.json({
    websocket: {
      url: wsUrl,
      port: serverPort
    },
    fallback: {
      enabled: true,
      pollInterval: 1000
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Send a message via HTTP (fallback for WebSocket)
router.post('/message', (req, res) => {
  try {
    const { type, message, clientId = uuidv4() } = req.body;
    
    logger.info('Received fallback message', {
      clientId,
      type,
      messageLength: typeof message === 'string' ? message.length : JSON.stringify(message).length
    });
    
    // Create message object
    const fallbackMessage = {
      id: uuidv4(),
      clientId,
      type: type || 'unknown',
      message,
      timestamp: Date.now()
    };
    
    // Add to message store
    messageStore.push(fallbackMessage);
    
    // Trim message store if needed
    if (messageStore.length > MAX_MESSAGES) {
      messageStore.shift();
    }
    
    // Echo the message back
    const response = {
      id: fallbackMessage.id,
      type: 'echo',
      clientId,
      message,
      timestamp: Date.now(),
      status: 'received'
    };
    
    res.json(response);
    
    // If WebSocket server is available, broadcast the message
    // This allows hybrid clients that can use both WebSockets and HTTP
    const wss = req.app.locals.wss;
    if (wss && wss.clients && wss.clients.size > 0) {
      const broadcastMsg = {
        type: 'fallback',
        clientId,
        message,
        timestamp: Date.now()
      };
      
      const jsonMessage = JSON.stringify(broadcastMsg);
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          client.send(jsonMessage);
        }
      });
      
      logger.info('Broadcasted fallback message to WebSocket clients', {
        clientCount: wss.clients.size
      });
    }
  } catch (error) {
    logger.error('Error processing fallback message', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      error: 'Failed to process message',
      timestamp: Date.now()
    });
  }
});

// Poll for new messages (fallback for WebSocket)
router.get('/poll', (req, res) => {
  const { clientId, since = 0 } = req.query;
  
  if (!clientId) {
    return res.status(400).json({
      error: 'Missing clientId parameter',
      timestamp: Date.now()
    });
  }
  
  // Filter messages for this client that are newer than the 'since' timestamp
  const sinceTimestamp = parseInt(since, 10) || 0;
  const messages = messageStore.filter(msg => 
    msg.clientId === clientId && msg.timestamp > sinceTimestamp
  );
  
  logger.info('Client polled for messages', {
    clientId,
    sinceTimestamp,
    messageCount: messages.length
  });
  
  res.json({
    messages,
    timestamp: Date.now(),
    nextPoll: Date.now() + 1000
  });
});

// Health check endpoint for HTTP fallback
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    mode: 'http-fallback'
  });
});

export default router;