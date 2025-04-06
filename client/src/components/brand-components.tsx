
import React from 'react';
import { Brain, Sparkles, Lightbulb, Layers, BarChart4 } from 'lucide-react';
import { DeepVisualization, AdvancedFeatureCard } from './deep-visualizations';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'icon-only';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };
  
  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  // Use a dynamic, advanced visualization for the logo
  const renderLogo = () => (
    <div className={`${sizeClasses[size]} aspect-square rounded-full flex items-center justify-center relative overflow-hidden`}>
      {/* Background glow */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/20"
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          backgroundPosition: { duration: 8, repeat: Infinity, repeatType: 'reverse' },
          scale: { duration: 3, repeat: Infinity, repeatType: 'reverse' }
        }}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      {/* Dynamic wave patterns */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M25,50 C35,40 65,60 75,50"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="100"
          animate={{ strokeDashoffset: [100, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />
        
        <motion.path
          d="M25,40 C35,30 65,70 75,60"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="120"
          animate={{ strokeDashoffset: [120, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: 0.2
          }}
        />
        
        <motion.path
          d="M25,60 C35,50 65,50 75,40"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="110"
          animate={{ strokeDashoffset: [110, 0] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: 0.4
          }}
        />
      </svg>
      
      {/* Central D + cross */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dynamic D */}
          <motion.path 
            d="M7,18 L7,6 L12,6 C14.2091,6 16,7.79086 16,10 L16,14 C16,16.2091 14.2091,18 12,18 L7,18 Z" 
            stroke="white" 
            strokeWidth="2" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Parallel lines and cross */}
          <motion.path 
            d="M12 4V20M4 12H20M7 7L17 17M17 7L7 17" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          />
        </svg>
      </div>
      
      {/* Pulsing halo */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-white/30"
        animate={{ 
          scale: [0.6, 1.2, 0.6],
          opacity: [0, 0.2, 0] 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
    </div>
  );
  
  return (
    <div className={`${className} flex items-center`}>
      {renderLogo()}
      
      {variant !== 'icon-only' && (
        <div className="ml-3 flex flex-col">
          <span className={`font-bold leading-none ${textSize[size]} text-foreground`}>
            Deep<span className="text-primary">Parallel</span>
          </span>
          {variant === 'default' && (
            <span className="text-xs text-muted-foreground mt-0.5">
              Multi-Stage Thought Pipeline
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color = 'hsl(var(--primary))',
  className = ''
}) => {
  return (
    <div className={`${className} processing-card p-5 rounded-lg border border-border/50`}>
      <div 
        className="w-10 h-10 rounded-md flex items-center justify-center mb-3" 
        style={{ backgroundColor: `${color.replace('hsl', 'hsla').replace(')', ', 0.1)')}` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      
      <h3 className="font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export const FeatureGrid: React.FC<{className?: string}> = ({ className = '' }) => {
  const features = [
    {
      type: 'parallel-processing' as const,
      title: "Parallel Processing",
      description: "Simultaneous evaluation by multiple specialized models for superior depth"
    },
    {
      type: 'deep-synthesis' as const,
      title: "Deep Synthesis",
      description: "Pattern recognition and cross-model insight aggregation"
    },
    {
      type: 'concept-enhancement' as const,
      title: "Concept Enhancement",
      description: "Recursive improvement through targeted thought amplification"
    },
    {
      type: 'multi-stage' as const,
      title: "Multi-Stage Pipeline",
      description: "Sophisticated processing through sequential specialized stages"
    },
    {
      type: 'performance-metrics' as const,
      title: "Performance Metrics",
      description: "Detailed analytics on model performance and thought evolution"
    }
  ];
  
  return (
    <div className={`${className} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`}>
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <AdvancedFeatureCard
            type={feature.type}
            title={feature.title}
            description={feature.description}
          />
        </motion.div>
      ))}
    </div>
  );
};

export const GradientHeading: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}> = ({ children, className = '', as = 'h2' }) => {
  const baseStyle = "font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-flow";
  const Tag = as;
  
  return (
    <Tag className={`${baseStyle} ${className}`} style={{ backgroundSize: '200% auto' }}>
      {children}
    </Tag>
  );
};

export const HeroPattern: React.FC<{className?: string}> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 ${className} overflow-hidden pointer-events-none`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_30%,transparent_100%)] opacity-[0.05]"></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[100px] opacity-30"></div>
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-secondary/20 blur-[80px] opacity-20"></div>
      <div className="absolute bottom-[30%] left-[30%] w-[250px] h-[250px] rounded-full bg-accent/20 blur-[70px] opacity-20"></div>
    </div>
  );
};

export default {
  Logo,
  FeatureCard,
  FeatureGrid,
  GradientHeading,
  HeroPattern
};
