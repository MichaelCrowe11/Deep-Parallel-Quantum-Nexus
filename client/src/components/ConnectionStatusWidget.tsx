import React from 'react';
import { useConnection, ConnectionStatus as ConnectionStatusDisplay } from '../utils/ConnectionDetector';

/**
 * ConnectionStatusWidget - A UI component that displays the current connection status
 * and provides controls to reconnect or switch connection modes
 */
const ConnectionStatusWidget: React.FC = () => {
  const { 
    status, 
    mode, 
    isConnected, 
    wsUrl, 
    httpUrl, 
    connect, 
    disconnect,
    lastError 
  } = useConnection();

  // Determine status color and icon
  let statusColor = '';
  let statusIcon = '';
  let statusText = '';

  switch (status) {
    case 'connected':
      statusColor = 'bg-green-100 border-green-500 text-green-700';
      statusIcon = '✓';
      statusText = 'Connected via WebSocket';
      break;
    case 'fallback':
      statusColor = 'bg-yellow-100 border-yellow-500 text-yellow-700';
      statusIcon = '⚠';
      statusText = 'Connected via HTTP Fallback';
      break;
    case 'connecting':
      statusColor = 'bg-blue-100 border-blue-500 text-blue-700';
      statusIcon = '⟳';
      statusText = 'Connecting...';
      break;
    case 'disconnected':
      statusColor = 'bg-gray-100 border-gray-500 text-gray-700';
      statusIcon = '⏻';
      statusText = 'Disconnected';
      break;
    case 'error':
      statusColor = 'bg-red-100 border-red-500 text-red-700';
      statusIcon = '✗';
      statusText = 'Connection Error';
      break;
    default:
      statusColor = 'bg-gray-100 border-gray-500 text-gray-700';
      statusIcon = '?';
      statusText = 'Unknown Status';
  }

  return (
    <div className="connection-status-widget border rounded-md p-3 mb-4 shadow-sm">
      <div className={`status-indicator ${statusColor} px-3 py-2 rounded-md border-l-4 mb-2 flex items-center`}>
        <span className="status-icon mr-2 text-lg">{statusIcon}</span>
        <span className="status-text font-medium">{statusText}</span>
      </div>
      
      <div className="connection-details text-sm mb-2">
        <div><span className="font-semibold">Mode:</span> {mode === 'none' ? 'Not connected' : mode}</div>
        {wsUrl && <div><span className="font-semibold">WebSocket URL:</span> {wsUrl}</div>}
        {httpUrl && <div><span className="font-semibold">HTTP Fallback URL:</span> {httpUrl}</div>}
        {lastError && (
          <div className="error-message mt-1 text-red-600">
            Error: {lastError.message}
          </div>
        )}
      </div>
      
      <div className="connection-controls flex gap-2">
        {isConnected ? (
          <button 
            onClick={disconnect}
            className="px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
          >
            Disconnect
          </button>
        ) : (
          <button 
            onClick={connect}
            className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusWidget;