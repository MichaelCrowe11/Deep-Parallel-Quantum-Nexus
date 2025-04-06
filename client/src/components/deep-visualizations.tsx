import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/config/assets';

interface DeepVisualizationProps {
  type: 'parallel-processing' | 'deep-synthesis' | 'concept-enhancement' | 'multi-stage' | 'performance-metrics';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
  title?: string;
}

/**
 * Advanced, immersive visualizations that represent Deep Parallel's sophisticated
 * thought processing capabilities in a way that's mind-expanding and visually striking.
 */
export const DeepVisualization: React.FC<DeepVisualizationProps> = ({
  type,
  size = 'md',
  className = '',
  animated = true,
  title,
}) => {
  // Size classes for the container
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  // Color schemes for each visualization type
  const colorSchemes = {
    'parallel-processing': {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'from-blue-300 to-indigo-400',
      accent: 'from-purple-400 to-pink-400',
      bg: 'rgba(30, 64, 175, 0.1)'
    },
    'deep-synthesis': {
      primary: 'from-purple-500 to-pink-600',
      secondary: 'from-purple-300 to-pink-400',
      accent: 'from-yellow-400 to-orange-400',
      bg: 'rgba(126, 34, 206, 0.1)'
    },
    'concept-enhancement': {
      primary: 'from-green-500 to-teal-600',
      secondary: 'from-green-300 to-teal-400',
      accent: 'from-blue-400 to-indigo-400',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    'multi-stage': {
      primary: 'from-indigo-500 to-purple-600', 
      secondary: 'from-indigo-300 to-purple-400',
      accent: 'from-pink-400 to-red-400',
      bg: 'rgba(99, 102, 241, 0.1)'
    },
    'performance-metrics': {
      primary: 'from-red-500 to-orange-600',
      secondary: 'from-red-300 to-orange-400', 
      accent: 'from-yellow-400 to-amber-400',
      bg: 'rgba(239, 68, 68, 0.1)'
    }
  };

  const colors = colorSchemes[type];

  // Render the appropriate visualization based on the type
  const renderVisualization = () => {
    switch (type) {
      case 'parallel-processing':
        return (
          <div className="relative w-full h-full">
            {/* Multiple parallel tracks/lines representing parallel processing */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full h-1 left-0 right-0 bg-gradient-to-r ${colors.primary}`}
                style={{
                  top: `${20 + i * 15}%`,
                  opacity: 0.6 + (i * 0.08),
                }}
                animate={animated ? {
                  scaleX: [0.3, 1, 0.3],
                  x: ['-25%', '0%', '25%'],
                } : {}}
                transition={{
                  duration: 3,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
            {/* Pulsing central node */}
            <motion.div
              className={`absolute rounded-full bg-gradient-to-br ${colors.accent} shadow-lg`}
              style={{
                height: '40%',
                width: '40%',
                top: '30%',
                left: '30%',
              }}
              animate={animated ? {
                scale: [1, 1.2, 1],
                opacity: [0.9, 1, 0.9],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </div>
        );

      case 'deep-synthesis':
        return (
          <div className="relative w-full h-full">
            {/* Dynamic honeycomb/mesh pattern */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="deepSynthesisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="rgb(217, 70, 239)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <motion.g
                animate={animated ? { rotate: [0, 360] } : {}}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                {/* Hexagonal pattern */}
                <path d="M30,10 L50,0 L70,10 L70,30 L50,40 L30,30 Z" fill="url(#deepSynthesisGradient)" fillOpacity="0.5" />
                <path d="M30,50 L50,40 L70,50 L70,70 L50,80 L30,70 Z" fill="url(#deepSynthesisGradient)" fillOpacity="0.7" />
                <path d="M70,50 L90,40 L110,50 L110,70 L90,80 L70,70 Z" fill="url(#deepSynthesisGradient)" fillOpacity="0.5" />
                <path d="M0,50 L20,40 L40,50 L40,70 L20,80 L0,70 Z" fill="url(#deepSynthesisGradient)" fillOpacity="0.3" />
                <path d="M30,90 L50,80 L70,90 L70,110 L50,120 L30,110 Z" fill="url(#deepSynthesisGradient)" fillOpacity="0.4" />
              </motion.g>
            </svg>
            
            {/* Central converging element */}
            <motion.div
              className="absolute rounded-full bg-[#ffffff] shadow-lg"
              style={{
                height: '25%',
                width: '25%',
                top: '37.5%',
                left: '37.5%',
              }}
              animate={animated ? {
                scale: [1, 1.2, 1],
                opacity: [0.9, 1, 0.9],
                boxShadow: [
                  '0 0 10px 2px rgba(168, 85, 247, 0.7)',
                  '0 0 20px 10px rgba(217, 70, 239, 0.8)',
                  '0 0 10px 2px rgba(168, 85, 247, 0.7)',
                ]
              } : {}}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </div>
        );

      case 'concept-enhancement':
        return (
          <div className="relative w-full h-full">
            {/* Growing/expanding circular wave patterns */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full border-2 border-green-500`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0,
                }}
                animate={animated ? {
                  scale: [0, 2.5],
                  opacity: [0.8, 0],
                } : {}}
                transition={{
                  duration: 2.5,
                  delay: i * 0.6,
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              />
            ))}
            
            {/* Central pulsing sphere */}
            <motion.div
              className={`absolute rounded-full bg-gradient-to-br ${colors.primary}`}
              style={{
                height: '35%',
                width: '35%',
                top: '32.5%',
                left: '32.5%',
              }}
              animate={animated ? {
                scale: [1, 1.15, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            
            {/* Particles around the central sphere */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 8;
              const radius = 38;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              
              return (
                <motion.div
                  key={i}
                  className={`absolute rounded-full bg-gradient-to-br ${colors.accent}`}
                  style={{
                    height: '10%',
                    width: '10%',
                    top: `${y - 5}%`,
                    left: `${x - 5}%`,
                  }}
                  animate={animated ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 1, 0.8],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              );
            })}
          </div>
        );

      case 'multi-stage':
        return (
          <div className="relative w-full h-full">
            {/* Sequential stages */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="multiStageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                  <stop offset="100%" stopColor="rgb(124, 58, 237)" />
                </linearGradient>
              </defs>
              
              {/* Flow path */}
              <motion.path
                d="M10,50 C30,30 70,70 90,50"
                stroke="url(#multiStageGradient)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="160"
                animate={animated ? { strokeDashoffset: [160, 0] } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
              
              {/* Stage nodes */}
              {[0, 1, 2, 3].map((i) => {
                const x = 10 + i * (80 / 3);
                let y = 50;
                
                // Adjust y to follow the curve
                if (i === 1) y = 36;
                if (i === 2) y = 64;
                
                return (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#ffffff"
                    stroke="url(#multiStageGradient)"
                    strokeWidth="2"
                    animate={animated ? { 
                      opacity: [0.8, 1, 0.8],
                      ...(i === 3 ? { fill: ['#ffffff', '#c4b5fd', '#ffffff'] } : {})
                    } : {}}
                    // Fixed radius instead of animating it
                    transition={{
                      duration: 2,
                      delay: i * 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                );
              })}
            </svg>
          </div>
        );

      case 'performance-metrics':
        return (
          <div className="relative w-full h-full">
            {/* Dynamic bar chart */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="metricsGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="rgb(239, 68, 68)" />
                  <stop offset="100%" stopColor="rgb(249, 115, 22)" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <line x1="10" y1="80" x2="90" y2="80" stroke="#888" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="10" y1="60" x2="90" y2="60" stroke="#888" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="10" y1="40" x2="90" y2="40" stroke="#888" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="10" y1="20" x2="90" y2="20" stroke="#888" strokeWidth="1" strokeOpacity="0.3" />
              
              {/* Bars */}
              {[0, 1, 2, 3, 4].map((i) => {
                const x = 18 + i * 15;
                
                return (
                  <motion.rect
                    key={i}
                    x={x}
                    width="10"
                    y="80"
                    height="0"
                    fill="url(#metricsGradient)"
                    animate={animated ? { 
                      height: [0, 30 + Math.random() * 40, 0],
                      y: [80, 50 - Math.random() * 40, 80]
                    } : {}}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                );
              })}
              
              {/* Axis */}
              <line x1="10" y1="10" x2="10" y2="80" stroke="#888" strokeWidth="1" />
              <line x1="10" y1="80" x2="90" y2="80" stroke="#888" strokeWidth="1" />
            </svg>
            
            {/* Pulse dot for real-time data */}
            <motion.div
              className="absolute rounded-full bg-red-500"
              style={{
                height: '10%',
                width: '10%',
                bottom: '10%',
                right: '10%',
              }}
              animate={animated ? {
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative overflow-hidden rounded-full', sizeClasses[size], className)}
         style={{ background: colors.bg }}>
      {renderVisualization()}
      
      {title && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-medium">
          {title}
        </div>
      )}
    </div>
  );
};

/**
 * Feature card with advanced visualization
 */
export const AdvancedFeatureCard: React.FC<{
  type: 'parallel-processing' | 'deep-synthesis' | 'concept-enhancement' | 'multi-stage' | 'performance-metrics';
  title: string;
  description: string;
  className?: string;
}> = ({ type, title, description, className = '' }) => {
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl p-6 shadow-md bg-white/5 backdrop-blur-sm border border-white/10',
        'transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <DeepVisualization 
          type={type} 
          size="md"
          className="mt-1"
        />
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

/**
 * Component to showcase all visualization types
 */
export const VisualizationShowcase: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 p-6">
      <div className="flex flex-col items-center">
        <DeepVisualization type="parallel-processing" size="lg" />
        <p className="mt-8 text-sm font-medium">Parallel Processing</p>
      </div>
      <div className="flex flex-col items-center">
        <DeepVisualization type="deep-synthesis" size="lg" />
        <p className="mt-8 text-sm font-medium">Deep Synthesis</p>
      </div>
      <div className="flex flex-col items-center">
        <DeepVisualization type="concept-enhancement" size="lg" />
        <p className="mt-8 text-sm font-medium">Concept Enhancement</p>
      </div>
      <div className="flex flex-col items-center">
        <DeepVisualization type="multi-stage" size="lg" />
        <p className="mt-8 text-sm font-medium">Multi-Stage Pipeline</p>
      </div>
      <div className="flex flex-col items-center">
        <DeepVisualization type="performance-metrics" size="lg" />
        <p className="mt-8 text-sm font-medium">Performance Metrics</p>
      </div>
    </div>
  );
};