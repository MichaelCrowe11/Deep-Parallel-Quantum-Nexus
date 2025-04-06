
import React from 'react';

type NeuralLoadingProps = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'dots' | 'network';
  text?: string;
  className?: string;
};

export function NeuralLoading({ 
  size = 'md', 
  variant = 'spinner', 
  text,
  className = '' 
}: NeuralLoadingProps) {
  const sizeMap = {
    sm: { container: 'h-8', spinner: 'h-6 w-6', text: 'text-xs' },
    md: { container: 'h-12', spinner: 'h-8 w-8', text: 'text-sm' },
    lg: { container: 'h-16', spinner: 'h-12 w-12', text: 'text-base' },
  };

  const spinnerVariant = (
    <div className={`${sizeMap[size].spinner} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
      <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
      </div>
    </div>
  );

  const pulseVariant = (
    <div className={`${sizeMap[size].spinner} flex items-center justify-center`}>
      <div className="w-3 h-3 rounded-full bg-primary animate-pulse mr-1"></div>
      <div className="w-3 h-3 rounded-full bg-secondary animate-pulse delay-100 mr-1"></div>
      <div className="w-3 h-3 rounded-full bg-accent animate-pulse delay-200"></div>
    </div>
  );

  const dotsVariant = (
    <div className={`${sizeMap[size].spinner} flex items-center space-x-1`}>
      {[0, 1, 2].map(i => (
        <div 
          key={i}
          className="w-2 h-2 bg-primary rounded-full" 
          style={{animation: `thought-flow-pulse 1.5s ease-in-out ${i * 0.2}s infinite`}}
        ></div>
      ))}
    </div>
  );

  const networkVariant = (
    <div className={`${sizeMap[size].spinner} relative`}>
      <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="22.5" cy="22.5" r="10" fill="none" stroke="currentColor" className="text-primary" strokeWidth="1" />
        
        <circle cx="22.5" cy="22.5" r="18" fill="none" stroke="currentColor" className="text-secondary/50" strokeWidth="0.5" strokeDasharray="4 2" style={{animation: 'spin 10s linear infinite'}} />
        
        <circle cx="22.5" cy="22.5" r="2" fill="currentColor" className="text-primary" />
        
        {/* Nodes */}
        <circle cx="10" cy="22.5" r="1.5" fill="currentColor" className="text-primary/70" style={{animation: 'pulse 2s ease-in-out infinite'}} />
        <circle cx="35" cy="22.5" r="1.5" fill="currentColor" className="text-secondary/70" style={{animation: 'pulse 2s ease-in-out 0.3s infinite'}} />
        <circle cx="22.5" cy="10" r="1.5" fill="currentColor" className="text-accent/70" style={{animation: 'pulse 2s ease-in-out 0.6s infinite'}} />
        <circle cx="22.5" cy="35" r="1.5" fill="currentColor" className="text-primary/70" style={{animation: 'pulse 2s ease-in-out 0.9s infinite'}} />
        
        {/* Connecting lines */}
        <line x1="12" y1="22.5" x2="20.5" y2="22.5" stroke="currentColor" className="text-primary/50" strokeWidth="0.5" strokeDasharray="50" strokeDashoffset="0" style={{animation: 'flow-line 2s linear infinite'}} />
        <line x1="24.5" y1="22.5" x2="33" y2="22.5" stroke="currentColor" className="text-secondary/50" strokeWidth="0.5" strokeDasharray="50" strokeDashoffset="0" style={{animation: 'flow-line 2s linear infinite'}} />
        <line x1="22.5" y1="12" x2="22.5" y2="20.5" stroke="currentColor" className="text-accent/50" strokeWidth="0.5" strokeDasharray="50" strokeDashoffset="0" style={{animation: 'flow-line 2s linear infinite'}} />
        <line x1="22.5" y1="24.5" x2="22.5" y2="33" stroke="currentColor" className="text-primary/50" strokeWidth="0.5" strokeDasharray="50" strokeDashoffset="0" style={{animation: 'flow-line 2s linear infinite'}} />
      </svg>
    </div>
  );

  const variantMap = {
    spinner: spinnerVariant,
    pulse: pulseVariant,
    dots: dotsVariant,
    network: networkVariant,
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeMap[size].container} ${className}`}>
      {variantMap[variant]}
      {text && <p className={`mt-2 text-muted-foreground ${sizeMap[size].text}`}>{text}</p>}
    </div>
  );
}
