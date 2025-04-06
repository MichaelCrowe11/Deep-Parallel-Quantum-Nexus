
import React from 'react';
import { Brain, Eye, Lightbulb, GitBranch, ArrowRight } from 'lucide-react';

interface VisualRepresentation {
  [scene: string]: string[];
}

interface ThoughtData {
  id: string;
  title: string;
  description: string;
  visualRepresentations?: VisualRepresentation;
  concepts?: string[];
  connections?: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
}

interface ThoughtVisualizationProps {
  thought: ThoughtData;
  className?: string;
}

export const ThoughtVisualization: React.FC<ThoughtVisualizationProps> = ({ thought, className = '' }) => {
  return (
    <div className={`${className} processing-card rounded-lg p-5 neural-pattern`}>
      <div className="flex items-center mb-4">
        <Brain className="text-primary h-5 w-5 mr-2" />
        <h3 className="font-medium text-foreground">{thought.title}</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-5">{thought.description}</p>
      
      {/* Concepts */}
      {thought.concepts && thought.concepts.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center mb-2">
            <Lightbulb className="h-4 w-4 mr-2 text-secondary" />
            <p className="text-sm font-medium">Key Concepts</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {thought.concepts.map((concept, index) => (
              <span 
                key={index} 
                className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full inline-flex items-center"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Connections */}
      {thought.connections && thought.connections.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center mb-2">
            <GitBranch className="h-4 w-4 mr-2 text-primary" />
            <p className="text-sm font-medium">Connections</p>
          </div>
          <div className="space-y-2">
            {thought.connections.map((connection, index) => {
              // Calculate opacity based on connection strength (0.3 to 1)
              const opacity = 0.3 + (connection.strength * 0.7);
              
              return (
                <div 
                  key={index} 
                  className="text-xs p-2 rounded bg-background/80"
                  style={{ 
                    boxShadow: `inset 0 0 0 1px hsla(var(--border), ${opacity})`
                  }}
                >
                  <div className="flex items-center">
                    <span className="font-medium text-foreground">{connection.from}</span>
                    <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                    <span className="font-medium text-foreground">{connection.to}</span>
                    <div 
                      className="ml-auto bg-primary/20 rounded-full h-1.5 w-12"
                      title={`Connection Strength: ${Math.round(connection.strength * 100)}%`}
                    >
                      <div 
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${connection.strength * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Visual Representations */}
      {thought.visualRepresentations && typeof thought.visualRepresentations === 'object' && (
        <div className="p-3 rounded bg-accent/5 border border-accent/10 thought-flow">
          <div className="flex items-center mb-2">
            <Eye className="h-4 w-4 mr-2 text-accent" />
            <p className="text-sm font-medium">Visual Concepts</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(thought.visualRepresentations).map(([scene, elements]) => (
              <div key={scene} className="text-xs">
                <p className="font-medium text-accent mb-1">{scene}</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  {Array.isArray(elements) && elements.map((element: string, i: number) => (
                    <li key={i} className="hover:text-accent transition-colors duration-300">{element}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtVisualization;
