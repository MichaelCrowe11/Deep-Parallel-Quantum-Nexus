import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Braces, 
  Brain, 
  Sparkles, 
  Lightbulb, 
  Image, 
  Network, 
  Boxes, 
  Waypoints,
  GitBranch,
  GitMerge,
  Eye,
  Check
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
// Replace reference to fadeIn with direct animation object definition
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

export type PipelineStage = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  model?: string;
};

interface ParallelProcessingPipelineProps {
  stages: PipelineStage[];
  activeStage?: string;
  onStageComplete?: (stageId: string) => void;
  className?: string;
  showDetails?: boolean;
}

export const ParallelProcessingPipeline: React.FC<ParallelProcessingPipelineProps> = ({
  stages,
  activeStage,
  onStageComplete,
  className = '',
  showDetails = true
}) => {
  const [animatedStages, setAnimatedStages] = useState<string[]>([]);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  
  // Animate stages sequentially on first render
  useEffect(() => {
    if (stages.length === 0) return;
    
    const animationSequence = async () => {
      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setAnimatedStages(prev => [...prev, stage.id]);
      }
    };
    
    animationSequence();
  }, [stages]);

  return (
    <div className={cn('rounded-lg overflow-hidden shadow-lg bg-card', className)}>
      <div className="p-4 sm:p-5">
        {showDetails && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground flex items-center">
              <GitBranch className="mr-2 h-5 w-5 text-primary" />
              Multi-Stage Parallel Processing Pipeline
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our proprietary multi-model thought analysis pipeline transforms complex concepts into visual narratives
            </p>
          </div>
        )}
        
        <div className="space-y-5">
          {stages.map((stage, index) => {
            const isActive = activeStage === stage.id;
            const isHovered = hoveredStage === stage.id;
            const isAnimated = animatedStages.includes(stage.id);
            const isCompleted = stage.status === 'completed';
            
            return (
              <motion.div
                key={stage.id}
                initial="initial"
                animate={isAnimated ? "animate" : "initial"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative p-4 rounded-lg border transition-all duration-300",
                  isActive ? "border-primary/50 bg-primary/5" : "border-border/50",
                  isCompleted ? "border-green-500/30 bg-green-500/5" : "",
                  isHovered ? "border-primary/30" : ""
                )}
                onMouseEnter={() => setHoveredStage(stage.id)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      isCompleted ? "bg-green-500 text-white" : "",
                      stage.status === 'processing' ? "animate-pulse" : ""
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <div className="h-5 w-5">{stage.icon}</div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "font-medium text-sm",
                        isActive ? "text-primary" : "text-foreground",
                        isCompleted ? "text-green-500" : ""
                      )}>
                        {stage.name}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        {stage.model && (
                          <Badge variant="outline" className="text-xs">
                            {stage.model}
                          </Badge>
                        )}
                        <Badge 
                          variant={
                            stage.status === 'idle' ? "outline" :
                            stage.status === 'processing' ? "secondary" :
                            stage.status === 'completed' ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {stage.status === 'idle' ? "Waiting" :
                           stage.status === 'processing' ? "Processing" :
                           stage.status === 'completed' ? "Completed" : "Error"}
                        </Badge>
                      </div>
                    </div>
                    
                    {showDetails && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {stage.description}
                      </p>
                    )}
                    
                    {(stage.status === 'processing' || stage.status === 'completed') && (
                      <Progress 
                        value={stage.status === 'completed' ? 100 : stage.progress} 
                        className="h-1.5 mt-1"
                      />
                    )}
                  </div>
                </div>
                
                {/* Connector line to next stage */}
                {index < stages.length - 1 && (
                  <div className="absolute h-5 border-l border-dashed border-border/50 left-[20px] -bottom-5"></div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Default pipeline stages that can be used as a starting point
export const defaultPipelineStages: PipelineStage[] = [
  {
    id: 'input',
    name: 'Input Analysis',
    description: 'Breaking down input into core concepts and elements',
    icon: <Braces />,
    status: 'idle',
    model: 'Claude 3.7'
  },
  {
    id: 'parallel',
    name: 'Parallel Processing',
    description: 'Running multiple specialized models simultaneously',
    icon: <Brain />,
    status: 'idle',
    model: 'Multi-model'
  },
  {
    id: 'pattern',
    name: 'Pattern Recognition',
    description: 'Identifying recurring patterns and conceptual structures',
    icon: <Network />,
    status: 'idle',
    model: 'Claude + Mistral'
  },
  {
    id: 'synthesis',
    name: 'Deep Synthesis',
    description: 'Combining insights from multiple analysis streams',
    icon: <GitMerge />,
    status: 'idle',
    model: 'Together AI'
  },
  {
    id: 'enhancement',
    name: 'Concept Enhancement',
    description: 'Refining and expanding core concepts',
    icon: <Lightbulb />,
    status: 'idle',
    model: 'GPT-4o'
  },
  {
    id: 'visualization',
    name: 'Visual Metaphor Generation',
    description: 'Creating visual representations of abstract concepts',
    icon: <Eye />,
    status: 'idle',
    model: 'DALL-E 3'
  },
  {
    id: 'scene',
    name: 'Scene Composition',
    description: 'Organizing visual elements into coherent scenes',
    icon: <Boxes />,
    status: 'idle',
    model: 'DeepInfra'
  }
];

export default ParallelProcessingPipeline;