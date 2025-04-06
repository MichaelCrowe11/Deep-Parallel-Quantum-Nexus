import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DeepParallelFontProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  customSize?: string;
  animated?: boolean;
  color?: 'default' | 'gradient' | 'light' | 'dark';
  weight?: 'light' | 'regular' | 'medium' | 'bold' | 'black';
  tracking?: 'normal' | 'wide' | 'wider' | 'tight';
  variant?: 'standard' | 'stylized' | 'minimal';
}

/**
 * A custom component for displaying the "Deep Parallel" brand name
 * with a unique, timeless typographic treatment
 */
export const DeepParallelFont: React.FC<DeepParallelFontProps> = ({
  className,
  size = 'md',
  customSize,
  animated = false,
  color = 'default',
  weight = 'bold',
  tracking = 'normal',
  variant = 'standard',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl',
    '2xl': 'text-4xl md:text-5xl',
    custom: customSize || '', // Custom size if provided
  };

  // Weight classes
  const weightClasses = {
    light: 'font-light',
    regular: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
    black: 'font-black',
  };

  // Tracking (letter-spacing) classes
  const trackingClasses = {
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    tight: 'tracking-tight',
  };

  // Color classes
  const colorClasses = {
    default: 'text-foreground',
    gradient: 'brand-gradient',
    light: 'text-white',
    dark: 'text-black',
  };

  // "Deep" animation variant
  const deepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };

  // "Parallel" animation variant - letters appear in sequence
  const parallelVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  // Individual letter animation
  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
      }
    }
  };

  // Enhanced standard variant with subtle depth and dimension
  const renderStandard = () => (
    <div 
      className={cn(
        'deep-parallel-font deep-parallel-font-standard flex flex-col md:flex-row items-center group',
        sizeClasses[size],
        weightClasses[weight],
        trackingClasses[tracking],
        className
      )}
    >
      {!animated ? (
        <div className="flex items-center relative">
          <span className={cn('font-bold relative pr-1', colorClasses[color])}>
            Deep
            {/* Subtle shadow effect for depth */}
            <span className="absolute -bottom-1 left-1 w-full h-full opacity-10 blur-[2px] text-neural-current select-none pointer-events-none">
              Deep
            </span>
          </span>
          
          {/* Subtle connector between words */}
          <span className="h-[60%] w-[1px] bg-gradient-to-b from-transparent via-neural-current to-transparent opacity-20 mx-1"></span>
          
          <span className={cn('md:ml-1 font-light relative', colorClasses[color])}>
            Parallel
            {/* Subtle shadow effect for depth */}
            <span className="absolute -bottom-1 left-1 w-full h-full opacity-10 blur-[2px] text-neural-current select-none pointer-events-none">
              Parallel
            </span>
            
            {/* Subtle underline that only appears on hover */}
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-neural-current to-deep-ocean opacity-0 group-hover:w-full group-hover:opacity-40 transition-all duration-500"></span>
          </span>
        </div>
      ) : (
        <div className="flex items-center relative">
          <motion.span 
            className={cn('font-bold relative pr-1', colorClasses[color])}
            initial="hidden"
            animate="visible"
            variants={deepVariants}
          >
            Deep
            {/* Animated shadow effect */}
            <motion.span 
              className="absolute -bottom-1 left-1 w-full h-full opacity-0 blur-[2px] text-neural-current select-none pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Deep
            </motion.span>
          </motion.span>
          
          {/* Animated connector */}
          <motion.span 
            className="h-[60%] w-[1px] bg-gradient-to-b from-transparent via-neural-current to-transparent opacity-0 mx-1"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 0.2, scaleY: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          ></motion.span>
          
          <motion.span 
            className={cn('md:ml-1 font-light relative', colorClasses[color])}
            initial="hidden"
            animate="visible"
            variants={parallelVariants}
          >
            {Array.from("Parallel").map((letter, i) => (
              <motion.span key={i} variants={letterVariants}>
                {letter}
              </motion.span>
            ))}
            
            {/* Animated shadow effect */}
            <motion.span 
              className="absolute -bottom-1 left-1 w-full h-full opacity-0 blur-[2px] text-neural-current select-none pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Parallel
            </motion.span>
          </motion.span>
        </div>
      )}
    </div>
  );

  // Enhanced stylized version with reflective elements and geometric accents
  const renderStylized = () => (
    <div 
      className={cn(
        'deep-parallel-font deep-parallel-font-stylized relative inline-block group',
        sizeClasses[size],
        weightClasses[weight],
        trackingClasses[tracking],
        className
      )}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center">
        {!animated ? (
          <>
            <span className={cn('font-black relative', colorClasses[color])}>
              <span className="relative">
                D<span className="absolute -top-1 right-0 w-1.5 h-1.5 bg-insight-aqua rounded-full opacity-80 group-hover:w-2 group-hover:h-2 group-hover:opacity-90 transition-all duration-300"></span>
              </span>
              <span className="relative">e<span className="absolute bottom-0 left-1/2 w-6 h-[1px] -translate-x-1/2 bg-neural-current opacity-30 group-hover:w-8 group-hover:opacity-60 transition-all duration-300"></span></span>
              <span className="relative">e</span>
              <span className="relative">p</span>
              {/* Reflective overlay with hover effects */}
              <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-40 rounded-sm group-hover:from-white/20 group-hover:opacity-50 transition-all duration-500"></span>
            </span>
            <span className={cn('md:ml-2 font-medium deep-parallel-stylized-underline relative', colorClasses[color])}>
              <span className="relative">P<span className="absolute top-0 right-0 w-1 h-1 bg-deep-ocean rounded-full opacity-60"></span></span>
              <span className="relative">a</span>
              <span className="relative">r</span>
              <span className="relative">a</span>
              <span className="relative">l</span>
              <span className="relative">l<span className="absolute -top-1 right-0 w-1 h-1 bg-insight-aqua rounded-full opacity-60"></span></span>
              <span className="relative">e</span>
              <span className="relative">l</span>
              {/* Parallel lines to emphasize the parallel concept */}
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-deep-ocean via-neural-current to-insight-aqua opacity-70"></span>
              <span className="absolute -bottom-3 left-0 w-3/4 h-[1px] bg-neural-current opacity-40"></span>
            </span>
          </>
        ) : (
          <>
            <motion.div 
              className={cn('font-black relative', colorClasses[color])}
              initial="hidden"
              animate="visible"
              variants={deepVariants}
            >
              <span className="relative">
                D<motion.span 
                  className="absolute -top-1 right-0 w-1.5 h-1.5 bg-insight-aqua rounded-full opacity-80"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                ></motion.span>
              </span>
              <span className="relative">e
                <motion.span 
                  className="absolute bottom-0 left-1/2 w-6 h-[1px] -translate-x-1/2 bg-neural-current opacity-30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                ></motion.span>
              </span>
              <span className="relative">e</span>
              <span className="relative">p</span>
              {/* Reflective overlay with animation */}
              <motion.span 
                className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 rounded-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              ></motion.span>
            </motion.div>
            <motion.div 
              className={cn('md:ml-2 font-medium deep-parallel-stylized-underline relative', colorClasses[color])}
              initial="hidden"
              animate="visible"
              variants={parallelVariants}
            >
              {Array.from("Parallel").map((letter, i) => (
                <motion.span key={i} variants={letterVariants} className="relative">
                  {letter}
                  {letter === 'P' && (
                    <motion.span 
                      className="absolute top-0 right-0 w-1 h-1 bg-deep-ocean rounded-full opacity-60"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
                    ></motion.span>
                  )}
                  {letter === 'l' && i === 5 && (
                    <motion.span 
                      className="absolute -top-1 right-0 w-1 h-1 bg-insight-aqua rounded-full opacity-60"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
                    ></motion.span>
                  )}
                </motion.span>
              ))}
              {/* Animated parallel lines */}
              <motion.span 
                className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-deep-ocean via-neural-current to-insight-aqua opacity-70"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              ></motion.span>
              <motion.span 
                className="absolute -bottom-3 left-0 w-3/4 h-[1px] bg-neural-current opacity-40"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              ></motion.span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );

  // Enhanced minimal, clean version with modernist touches
  const renderMinimal = () => (
    <div 
      className={cn(
        'deep-parallel-font deep-parallel-font-minimal inline-block group',
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        className
      )}
    >
      {!animated ? (
        <div className="relative flex items-center">
          <span className="relative">
            DEEP
            <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-neural-current opacity-40"></span>
          </span>
          <span className="mx-1 text-neural-current relative">
            <span className="w-[6px] h-[6px] inline-block rounded-full bg-neural-current transform translate-y-[-2px]"></span>
            <span className="absolute -bottom-1 left-1/2 w-[1px] h-[6px] bg-neural-current opacity-30"></span>
          </span>
          <span className="relative">
            PARALLEL
            <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-deep-ocean opacity-40"></span>
            {/* Enhanced hover effect */}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-insight-aqua opacity-0 group-hover:w-full group-hover:opacity-70 transition-all duration-500 ease-out"></span>
          </span>
          {/* Subtle horizontal bars for the parallel concept */}
          <span className="absolute -bottom-4 left-1/4 w-1/2 h-[1px] bg-insight-aqua opacity-30 group-hover:w-3/4 group-hover:opacity-50 transition-all duration-700"></span>
        </div>
      ) : (
        <motion.div
          className="relative flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            DEEP
            <motion.span 
              className="absolute -bottom-1 left-0 w-full h-[1px] bg-neural-current opacity-40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            ></motion.span>
          </motion.span>
          
          <motion.span 
            className="mx-1 text-neural-current relative"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <span className="w-[6px] h-[6px] inline-block rounded-full bg-neural-current transform translate-y-[-2px]"></span>
            <motion.span 
              className="absolute -bottom-1 left-1/2 w-[1px] h-[6px] bg-neural-current opacity-30"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.6, duration: 0.2 }}
            ></motion.span>
          </motion.span>
          
          <motion.span 
            className="relative"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            PARALLEL
            <motion.span 
              className="absolute -bottom-1 left-0 w-full h-[1px] bg-deep-ocean opacity-40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            ></motion.span>
          </motion.span>
          
          {/* Animated horizontal bars */}
          <motion.span 
            className="absolute -bottom-4 left-1/4 w-1/2 h-[1px] bg-insight-aqua opacity-30"
            initial={{ scaleX: 0, originX: 0.5 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          ></motion.span>
        </motion.div>
      )}
    </div>
  );

  // Render the appropriate variant
  const renderVariant = () => {
    switch (variant) {
      case 'stylized':
        return renderStylized();
      case 'minimal':
        return renderMinimal();
      case 'standard':
      default:
        return renderStandard();
    }
  };

  return renderVariant();
};

export default DeepParallelFont;