
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, MotionProps } from "framer-motion";

interface NeuroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "reflective" | "animated" | "flow";
  intensity?: "low" | "medium" | "high";
  hoverEffect?: boolean;
  children?: React.ReactNode;
  animate?: boolean;
  motionProps?: MotionProps;
}

const NeuroCard = React.forwardRef<HTMLDivElement, NeuroCardProps>(
  ({ 
    className, 
    variant = "default", 
    intensity = "medium",
    hoverEffect = true, 
    children, 
    animate = false,
    motionProps,
    ...props 
  }, ref) => {
    const baseClass = "rounded-lg p-6 transition-all duration-300";
    
    // Determine variant class
    const variantClass = {
      default: "neural-card",
      glass: "glass-card",
      reflective: "reflective-surface",
      animated: "animated-border bg-card/80 backdrop-blur-sm",
      flow: "flow-pattern neural-card"
    }[variant];
    
    // Determine intensity class
    const intensityClass = {
      low: "shadow-sm hover:shadow",
      medium: "shadow-md hover:shadow-lg",
      high: "shadow-lg hover:shadow-xl"
    }[intensity];
    
    // Determine hover effect
    const hoverClass = hoverEffect 
      ? "hover:-translate-y-1 hover:shadow-glow" 
      : "";
    
    // Combine classes
    const combinedClass = cn(
      baseClass,
      variantClass,
      intensityClass,
      hoverClass,
      className
    );
    
    // Return either a motion div or a regular div
    if (animate) {
      return (
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          className={combinedClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          {...motionProps}
          {...props}
        >
          {children}
        </motion.div>
      );
    }
    
    return (
      <div ref={ref} className={combinedClass} {...props}>
        {children}
      </div>
    );
  }
);
NeuroCard.displayName = "NeuroCard";

export { NeuroCard };
import React from 'react';

type NeuralCardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'processing' | 'insight' | 'glass';
  borderGlow?: boolean;
  pattern?: 'none' | 'neural' | 'hexagon' | 'circuit';
  className?: string;
};

export function NeuralCard({
  children,
  variant = 'default',
  borderGlow = false,
  pattern = 'none',
  className = '',
  ...props
}: NeuralCardProps) {
  // Base classes
  const baseClasses = 'rounded-lg p-6 transition-all duration-300';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-card border border-border/50',
    processing: 'processing-card',
    insight: 'insight-card',
    glass: 'glass-panel',
  };
  
  // Pattern classes
  const patternClasses = {
    none: '',
    neural: 'neural-pattern',
    hexagon: 'hexagon-pattern',
    circuit: 'circuit-pattern',
  };
  
  // Glow class
  const glowClass = borderGlow ? 'shadow-glow' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${patternClasses[pattern]} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
