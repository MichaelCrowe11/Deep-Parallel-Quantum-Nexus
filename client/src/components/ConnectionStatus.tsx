
import React, { useEffect, useState } from 'react';
import { useWebSocket, getWebSocketUrl } from '../utils/websocket';

export function ConnectionStatus() {
  const { status } = useWebSocket(getWebSocketUrl());
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/service/status');
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        console.error('API status check failed:', error);
        setApiStatus('offline');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusLabel = (type: 'ws' | 'api') => {
    if (type === 'ws') {
      return {
        connected: 'WebSocket Connected',
        connecting: 'WebSocket Connecting...',
        disconnected: 'WebSocket Disconnected',
        error: 'WebSocket Error'
      }[status];
    } else {
      return {
        online: 'API Online',
        offline: 'API Offline',
        checking: 'Checking API...'
      }[apiStatus];
    }
  };

  const getStatusColor = (type: 'ws' | 'api') => {
    if (type === 'ws') {
      return {
        connected: 'status-connected',
        connecting: 'status-connecting',
        disconnected: 'status-disconnected',
        error: 'status-error'
      }[status];
    } else {
      return {
        online: 'status-connected',
        offline: 'status-error',
        checking: 'status-connecting'
      }[apiStatus];
    }
  };

  return (
    <div className="connection-status flex items-center gap-4 p-2 rounded bg-card-bg">
      <div className="flex items-center">
        <span className={`status-dot ${getStatusColor('ws')}`}></span>
        <span className="text-sm">{getStatusLabel('ws')}</span>
      </div>
      <div className="flex items-center">
        <span className={`status-dot ${getStatusColor('api')}`}></span>
        <span className="text-sm">{getStatusLabel('api')}</span>
      </div>
    </div>
  );
}
