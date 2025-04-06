
import React from 'react';

type LogoProps = {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'light' | 'dark' | 'gradient';
  className?: string;
};

export function DeepParallelLogo({
  variant = 'full',
  size = 'md',
  color = 'default',
  className = '',
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-3xl' },
  };

  const colorMap = {
    default: 'text-primary',
    light: 'text-white',
    dark: 'text-black',
    gradient: 'bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {(variant === 'full' || variant === 'icon') && (
        <div className="deep-parallel-logo relative">
          <svg
            width={sizeMap[size].icon}
            height={sizeMap[size].icon}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={color === 'gradient' ? '' : colorMap[color]}
          >
            <path
              d="M32 4C16.536 4 4 16.536 4 32C4 47.464 16.536 60 32 60C47.464 60 60 47.464 60 32C60 16.536 47.464 4 32 4Z"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
            />
            <path
              d="M32 12C20.954 12 12 20.954 12 32C12 43.046 20.954 52 32 52C43.046 52 52 43.046 52 32C52 20.954 43.046 12 32 12Z"
              strokeWidth="1.5"
              stroke="currentColor"
              fill="none"
              strokeDasharray="4 2"
            />
            <path
              d="M46 32C46 39.732 39.732 46 32 46C24.268 46 18 39.732 18 32C18 24.268 24.268 18 32 18C39.732 18 46 24.268 46 32Z"
              strokeWidth="1.5"
              stroke="currentColor"
              fill="none"
            />
            <path
              d="M20 20L44 44"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
            />
            <path
              d="M20 44L44 20"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
            />
            <circle cx="32" cy="32" r="4" fill="currentColor" />
          </svg>
          
          {color === 'gradient' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          )}
        </div>
      )}
      
      {(variant === 'full' || variant === 'text') && (
        <span className={`ml-2 font-bold ${sizeMap[size].text} ${colorMap[color]}`}>
          DeepParallel
        </span>
      )}
    </div>
  );
}
