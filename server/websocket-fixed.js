/**
 * Deep Parallel AI - WebSocket Fixed Implementation
 * 
 * This module provides a simplified and reliable WebSocket implementation
 * that works well in Replit's environment, handling port conflicts and
 * connection issues that can occur with the standard implementation.
 */

const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const { createServer } = require('net');
const logger = require('./logger').default;

// WebSocket Server singleton
let wss = null;

// Connected clients
const clients = new Map();

// Default port to start with
const DEFAULT_PORT = 5000;

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise(resolve => {
    const server = createServer();
    
    server.once('error', () => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

/**
 * Find an available port
 */
async function findAvailablePort() {
  // Try the default port first
  if (await isPortAvailable(DEFAULT_PORT)) {
    return DEFAULT_PORT;
  }
  
  // Try ports in the range 5001-5050
  for (let port = DEFAULT_PORT + 1; port <= DEFAULT_PORT + 50; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  // If no port is available, return a random high port
  return Math.floor(Math.random() * 10000) + 9000;
}

/**
 * Set up WebSocket server with proper configuration for Replit
 * This fixed implementation avoids port conflicts
 */
function setupWebSocketServer(server) {
  if (wss) {
    logger.info('Using existing WebSocket server');
    return wss;
  }
  
  // Create a WebSocket server with noServer option to avoid port conflicts
  const wsServer = new WebSocket.Server({
    noServer: true,
    clientTracking: true
  });
  
  // Handle WebSocket connections
  wsServer.on('connection', (ws, req) => {
    const clientId = uuidv4();
    const ip = req.socket.remoteAddress || 'unknown';
    
    logger.info(`WebSocket client connected: ${clientId} from ${ip}`);
    
    // Store client
    clients.set(clientId, { 
      id: clientId, 
      ws, 
      ip, 
      connectedAt: Date.now(),
      lastActivity: Date.now()
    });
    
    // Handle messages
    ws.on('message', (message) => {
      try {
        const client = clients.get(clientId);
        if (client) {
          client.lastActivity = Date.now();
        }
        
        logger.info(`WebSocket message from ${clientId}`, { 
          messageLength: typeof message === 'string' ? message.length : '(binary)'
        });
        
        // Echo the message back as a simple test
        ws.send(JSON.stringify({
          type: 'echo',
          clientId, 
          message: message.toString(),
          timestamp: Date.now()
        }));
      } catch (err) {
        logger.error(`Error handling WebSocket message`, { clientId, error: err });
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      logger.info(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}`, { error: error.message });
      clients.delete(clientId);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      clientId,
      timestamp: Date.now(),
      message: 'Connected to Deep Parallel WebSocket server'
    }));
  });
  
  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    
    // Only handle WebSocket routes
    if (pathname.startsWith('/ws')) {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });
  
  // Start heartbeat
  setInterval(() => {
    const now = Date.now();
    clients.forEach((client, id) => {
      try {
        // Send heartbeat
        client.ws.send(JSON.stringify({ 
          type: 'heartbeat', 
          timestamp: now 
        }));
        
        // Check inactivity
        if (now - client.lastActivity > 5 * 60 * 1000) { // 5 minutes timeout
          logger.info(`Closing inactive client ${id}`);
          client.ws.terminate();
          clients.delete(id);
        }
      } catch (err) {
        logger.error(`Error sending heartbeat to client ${id}`, { error: err });
        clients.delete(id);
      }
    });
  }, 30000); // Every 30 seconds
  
  // Store the WebSocket server for future use
  wss = wsServer;
  
  return wsServer;
}

/**
 * Get client count 
 */
function getClientCount() {
  return clients.size;
}

/**
 * Broadcast a message to all connected clients
 */
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    try {
      client.ws.send(messageStr);
    } catch (err) {
      logger.error(`Error broadcasting to client ${client.id}`, { error: err });
    }
  });
}

/**
 * Send a message to a specific client
 */
function send(clientId, message) {
  const client = clients.get(clientId);
  if (client) {
    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (err) {
      logger.error(`Error sending message to client ${clientId}`, { error: err });
      return false;
    }
  }
  return false;
}

module.exports = {
  setupWebSocketServer,
  getClientCount,
  broadcast,
  send
};