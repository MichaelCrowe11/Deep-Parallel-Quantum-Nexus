import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IMAGES } from '@/config/assets';
import { cn } from '@/lib/utils';

interface CircularEnergyLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
  type?: 'thought' | 'urban' | 'data';
  animated?: boolean;
}

/**
 * A premium loader that uses the circular energy field visuals 
 * from Deep Parallel's unique visual language
 */
export const CircularEnergyLoader: React.FC<CircularEnergyLoaderProps> = ({
  size = 'md',
  className = '',
  message = 'Processing thought patterns',
  type = 'thought',
  animated = true
}) => {
  // Get images for each energy field type
  const circularEnergyFields = {
    thought: [
      IMAGES.categories.thought[0].src, // Neural flow visualization
      IMAGES.categories.thought[1].src, // Multi-dimensional reasoning
      IMAGES.featured.thoughtAnalysis,
    ],
    urban: [
      IMAGES.categories.urban[0].src, // Smart city data overlay
      IMAGES.categories.urban[1].src, // Urban data architecture
      IMAGES.featured.urbanInsights,
    ],
    data: [
      IMAGES.categories.data[0].src, // Information flow structures
      IMAGES.categories.data[4].src, // Information patterns
      IMAGES.featured.dataPatterns,
    ]
  };

  // Get circular fields based on type
  const fieldsForType = circularEnergyFields[type];
  
  // State for the currently displayed image
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Change image every 2 seconds if animated
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % fieldsForType.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [animated, fieldsForType.length]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    xl: 'w-64 h-64',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Current circular energy field */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
          animate={{ 
            rotate: [0, 360],
            scale: animated ? [1, 1.05, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 mix-blend-overlay" />
          <img 
            src={fieldsForType[currentImageIndex]} 
            alt="Circular energy field" 
            className="w-full h-full object-cover" 
          />
        </motion.div>
        
        {/* Inner pulsing circle */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(219,39,119,0.3) 0%, rgba(124,58,237,0.2) 50%, rgba(79,70,229,0.1) 100%)'
          }}
          animate={{ 
            scale: animated ? [1, 1.2, 1] : 1,
            opacity: animated ? [0.7, 0.5, 0.7] : 0.7
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Central bright spot */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffffff]"
          style={{ width: '15%', height: '15%' }}
          animate={{ 
            scale: animated ? [1, 1.5, 1] : 1,
            opacity: animated ? [0.9, 0.7, 0.9] : 0.9
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {message && (
        <motion.p 
          className="mt-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300"
          animate={{
            opacity: animated ? [0.7, 1, 0.7] : 0.9
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

/**
 * A fullscreen version of the CircularEnergyLoader that can be used as a page transition
 */
export const FullscreenEnergyLoader: React.FC<Omit<CircularEnergyLoaderProps, 'size'>> = ({
  className = '',
  message = 'Processing advanced AI thought patterns',
  type = 'thought',
  animated = true
}) => {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex flex-col items-center justify-center',
      'bg-gradient-to-br from-gray-900/90 via-gray-900/95 to-black',
      'backdrop-blur-sm',
      className
    )}>
      <CircularEnergyLoader
        size="xl"
        message={message}
        type={type}
        animated={animated}
      />
    </div>
  );
};

/**
 * A multi-stage energy loader that displays different types of circular energy fields 
 * based on the processing stage
 */
export const MultiStageEnergyLoader: React.FC<{
  stage: number;
  totalStages: number;
  messages?: string[];
  className?: string;
}> = ({
  stage = 0,
  totalStages = 3,
  messages = [
    'Initializing parallel thought processes',
    'Synthesizing conceptual frameworks',
    'Generating visual representations'
  ],
  className = ''
}) => {
  // Determine which type of energy field to display based on stage
  const getTypeForStage = (stage: number): 'thought' | 'urban' | 'data' => {
    if (stage < totalStages / 3) return 'thought';
    if (stage < (totalStages * 2) / 3) return 'urban';
    return 'data';
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center w-full', className)}>
      <CircularEnergyLoader
        size="lg"
        type={getTypeForStage(stage)}
        message={messages[Math.min(stage, messages.length - 1)]}
      />
      
      {/* Progress indicator */}
      <div className="w-64 h-1 bg-gray-200 rounded-full mt-8 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{ width: `${((stage + 1) / totalStages) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Stage {stage + 1} of {totalStages}
      </p>
    </div>
  );
};