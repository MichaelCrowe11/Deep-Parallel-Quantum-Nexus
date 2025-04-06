
import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

interface ServiceInfo {
  configured: boolean;
  key: string;
  status: string;
}

interface ServiceStatusData {
  status: string;
  services: {
    anthropic: ServiceInfo;
    together: ServiceInfo;
    mistral: ServiceInfo;
    deepInfra: ServiceInfo;
    openai: ServiceInfo;
    runway: ServiceInfo;
    perplexity: ServiceInfo;
  };
  allServicesConfigured: boolean;
}

export function ServiceStatus() {
  const [data, setData] = useState<ServiceStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await api.getServiceStatus();
        setData(response.data as unknown as ServiceStatusData);
        setError(null);
      } catch (err) {
        setError('Failed to load service status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h3>AI Services Status</h3>
        <div className="flex justify-center p-4">
          <div className="pulse">Loading service status...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3>AI Services Status</h3>
        <div className="text-error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="mb-4">AI Services Status</h3>
      
      <div className="mb-4">
        <div className={`flex items-center gap-2 mb-2 ${data.allServicesConfigured ? 'text-success' : 'text-warning'}`}>
          <div className={`status-dot ${data.allServicesConfigured ? 'status-connected' : 'status-connecting'}`}></div>
          <span className="font-medium">
            {data.allServicesConfigured 
              ? 'All services configured' 
              : 'Some services not configured'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.services).map(([name, info]) => (
          <div 
            key={name} 
            className="service-item p-3 rounded" 
            style={{ backgroundColor: 'var(--background-alt)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`status-dot ${info.configured ? 'status-connected' : 'status-disconnected'}`}></div>
              <span className="font-medium">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
            </div>
            <div className="text-sm text-foreground-alt">
              Status: {info.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
