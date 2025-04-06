
import React, { useState, useEffect } from 'react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

type SystemNotificationProps = {
  type?: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds
  onClose?: () => void;
  className?: string;
};

export function SystemNotification({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className = '',
}: SystemNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const typeClasses = {
    info: 'border-primary/30 bg-primary/10',
    success: 'border-green-500/30 bg-green-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    error: 'border-red-500/30 bg-red-500/10',
  };

  const iconMap = {
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-primary">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-green-500">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-yellow-500">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9v4M12 17h.01" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-red-500">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  };

  return (
    <div className={`glass-panel border ${typeClasses[type]} p-4 rounded-lg shadow-lg max-w-md animate-fade-in-up ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {iconMap[type]}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
        </div>
        <button
          type="button"
          className="ml-4 inline-flex text-muted-foreground hover:text-foreground"
          onClick={handleClose}
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
