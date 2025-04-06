
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

interface PipelineStageProps {
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'pending';
  index: number;
}

const PipelineStage = ({ name, description, status = 'pending', index }: PipelineStageProps) => (
  <div 
    className={cn(
      "relative flex items-center p-3 rounded-md mb-2 transition-all",
      status === 'active' ? "bg-primary/20 border border-primary/50" : 
      status === 'completed' ? "bg-muted border border-muted-foreground/20" : 
      "bg-card border border-border"
    )}
  >
    <div className={cn(
      "flex items-center justify-center w-8 h-8 rounded-full mr-3",
      status === 'active' ? "bg-primary text-primary-foreground" : 
      status === 'completed' ? "bg-muted-foreground/40 text-muted-foreground" : 
      "bg-card text-muted-foreground border border-border"
    )}>
      {index + 1}
    </div>
    <div className="flex-1">
      <h4 className={cn(
        "font-medium",
        status === 'active' ? "text-primary" : 
        status === 'completed' ? "text-muted-foreground" : 
        "text-foreground/70"
      )}>
        {name}
      </h4>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
    <div className={cn(
      "absolute -left-4 top-1/2 w-2 h-2 rounded-full",
      status === 'active' ? "bg-primary animate-pulse" : 
      status === 'completed' ? "bg-muted-foreground/40" : 
      "bg-border"
    )} />
  </div>
);

interface PipelineCardProps {
  title: string;
  description?: string;
  stages: Array<{
    name: string;
    description?: string;
    status?: 'active' | 'completed' | 'pending';
  }>;
  className?: string;
  footer?: React.ReactNode;
}

export const PipelineCard = ({ 
  title, 
  description, 
  stages, 
  className,
  footer
}: PipelineCardProps) => {
  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative pl-4 border-l border-border">
          {stages.map((stage, index) => (
            <PipelineStage 
              key={index}
              name={stage.name}
              description={stage.description}
              status={stage.status}
              index={index}
            />
          ))}
        </div>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};
