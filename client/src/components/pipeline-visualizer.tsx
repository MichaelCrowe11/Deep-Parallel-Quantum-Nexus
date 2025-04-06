
import React, { useState, useEffect } from 'react';
import { Brain, Braces, Sparkles, Lightbulb, Image, ArrowRight, Zap } from 'lucide-react';

const stages = [
  {
    id: 'input',
    name: 'Input Processing',
    icon: <Braces className="w-5 h-5" />,
    description: 'Initial prompt analysis and decomposition into concept elements',
    color: 'hsl(200, 100%, 60%)'
  },
  {
    id: 'parallel',
    name: 'Parallel Processing',
    icon: <Brain className="w-5 h-5" />,
    description: 'Simultaneous evaluation by multiple specialized models',
    color: 'hsl(220, 100%, 50%)'
  },
  {
    id: 'synthesis',
    name: 'Deep Synthesis',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Pattern recognition and cross-model insight aggregation',
    color: 'hsl(240, 100%, 70%)'
  },
  {
    id: 'enhancement',
    name: 'Concept Enhancement',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Recursive improvement through targeted thought amplification',
    color: 'hsl(260, 100%, 70%)'
  },
  {
    id: 'visualization',
    name: 'Visual Transformation',
    icon: <Image className="w-5 h-5" />,
    description: 'Translation of enhanced concepts into rich visual elements',
    color: 'hsl(180, 100%, 65%)'
  }
];

interface PipelineVisualizerProps {
  activeStage?: string;
  showDetails?: boolean;
  className?: string;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ 
  activeStage, 
  showDetails = true,
  className = ''
}) => {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [animatedStages, setAnimatedStages] = useState<string[]>([]);
  
  // Animate stages sequentially on first render
  useEffect(() => {
    const animationSequence = async () => {
      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setAnimatedStages(prev => [...prev, stage.id]);
      }
    };
    
    animationSequence();
  }, []);

  return (
    <div className={`${className} neural-pattern rounded-lg`}>
      <div className="p-4 sm:p-6">
        {showDetails && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2">Multi-Stage Thought Pipeline</h3>
            <p className="text-sm text-muted-foreground">
              Our proprietary processing pipeline transforms complex research concepts into rich, coherent visual narratives
            </p>
          </div>
        )}
        
        <div className="relative">
          {/* Connection lines */}
          <svg className="absolute top-8 left-0 w-full h-[calc(100%-32px)] overflow-visible z-0 pointer-events-none" 
               xmlns="http://www.w3.org/2000/svg">
            {stages.map((stage, i) => {
              if (i < stages.length - 1) {
                const isActive = activeStage === stage.id || hoveredStage === stage.id;
                return (
                  <path
                    key={`path-${i}`}
                    d={`M ${72} ${i * 80 + 12} C ${140} ${i * 80 + 12}, ${140} ${(i+1) * 80 + 12}, ${72} ${(i+1) * 80 + 12}`}
                    stroke={isActive ? stage.color : 'hsl(220, 20%, 20%)'}
                    strokeWidth={isActive ? 2 : 1}
                    fill="none"
                    strokeDasharray="4 2"
                    className={animatedStages.includes(stage.id) ? "animate-flow-line" : "opacity-0"}
                    style={{ 
                      strokeDasharray: isActive ? '0' : '4 2',
                      transition: 'stroke 0.3s ease, stroke-width 0.3s ease, stroke-dasharray 0.3s ease'
                    }}
                  />
                );
              }
              return null;
            })}
          </svg>
          
          {/* Stage nodes */}
          <div className="relative z-10">
            {stages.map((stage, i) => {
              const isActive = activeStage === stage.id;
              const isHovered = hoveredStage === stage.id;
              const isAnimated = animatedStages.includes(stage.id);
              
              return (
                <div
                  key={stage.id}
                  className={`flex items-start mb-6 last:mb-0 transition-all duration-300 transform 
                    ${isAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                  onMouseEnter={() => setHoveredStage(stage.id)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
                      ${isActive || isHovered ? 'animate-neural-pulse' : ''}`}
                    style={{
                      backgroundColor: `${isActive || isHovered ? 'hsla(220, 15%, 13%, 0.95)' : 'hsla(220, 15%, 11%, 0.5)'}`,
                      border: `1px solid ${isActive || isHovered ? stage.color : 'hsla(220, 15%, 20%, 0.5)'}`,
                      boxShadow: isActive || isHovered 
                        ? `0 0 15px 0 ${stage.color.replace('hsl', 'hsla').replace(')', ', 0.4)')}` 
                        : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ color: stage.color }} className="transition-transform duration-300">
                      {stage.icon}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center">
                      <h4 className="font-medium text-sm" style={{ 
                        color: isActive || isHovered ? stage.color : 'hsl(var(--foreground))' 
                      }}>
                        {stage.name}
                      </h4>
                      {isActive && (
                        <div className="ml-2 flex-shrink-0 bg-accent/10 py-0.5 px-2 rounded-full">
                          <span className="text-xs text-accent flex items-center">
                            <Zap className="w-3 h-3 mr-1" /> Active
                          </span>
                        </div>
                      )}
                    </div>
                    {showDetails && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {stage.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineVisualizer;
