
import React, { useState } from 'react';
import { useWebSocket, getWebSocketUrl } from '../utils/websocket';

interface PipelineStage {
  name: string;
  description: string;
  models: string[];
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function PipelineVisualizer() {
  const { status, messages, sendMessage } = useWebSocket(getWebSocketUrl());
  const [thought, setThought] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      name: 'Initial Multi-Model Parallel Analysis',
      description: 'Analyzing content with multiple foundation models in parallel',
      models: ['Llama-3.1', 'Claude-3-Opus', 'Perplexity', 'Mistral-Large'],
      status: 'pending'
    },
    {
      name: 'Deep Reasoning & Concept Extraction',
      description: 'Extracting core concepts and principles',
      models: ['Gemini-1.5-Pro', 'Claude-3-Opus'],
      status: 'pending'
    },
    {
      name: 'Pattern Recognition & Classification',
      description: 'Identifying patterns and creating taxonomy',
      models: ['Claude-3-Opus', 'Gemini-1.5-Pro'],
      status: 'pending'
    },
    {
      name: 'Visual Metaphor Generation',
      description: 'Creating visual representations for abstract concepts',
      models: ['Claude-3-Opus-Vision', 'Gemini-1.0-Pro-Vision'],
      status: 'pending'
    },
    {
      name: 'Scene Composition Planning',
      description: 'Planning detailed visual scenes and sequences',
      models: ['Claude-3-Opus', 'Gemini-1.5-Pro'],
      status: 'pending'
    }
  ]);

  // Listen for WebSocket messages
  React.useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      if (latestMessage.type === 'pipeline_update') {
        // Update pipeline stages based on progress
        setStages(prevStages => 
          prevStages.map((stage, index) => {
            if (index === latestMessage.stageIndex) {
              return {
                ...stage,
                status: latestMessage.status
              };
            } else if (index < latestMessage.stageIndex) {
              return {
                ...stage,
                status: 'completed'
              };
            }
            return stage;
          })
        );
        
        if (latestMessage.isComplete) {
          setIsProcessing(false);
        }
      }
    }
  }, [messages]);

  const handleProcess = async () => {
    if (!thought.trim() || status !== 'connected') return;
    
    setIsProcessing(true);
    // Reset stages to pending
    setStages(stages.map(stage => ({ ...stage, status: 'pending' })));
    
    // Start processing
    sendMessage({
      type: 'thought_update',
      data: {
        content: thought,
        timestamp: Date.now()
      }
    });
    
    // Simulate pipeline stages for demo
    simulatePipeline();
  };
  
  const simulatePipeline = () => {
    // This is just a simulation of pipeline progress for demo purposes
    // In a real implementation, progress would come from the WebSocket
    stages.forEach((_, index) => {
      setTimeout(() => {
        setStages(prevStages => 
          prevStages.map((stage, i) => {
            if (i === index) {
              return { ...stage, status: 'processing' };
            }
            return stage;
          })
        );
        
        // Set to completed after 2 seconds of processing
        setTimeout(() => {
          setStages(prevStages => 
            prevStages.map((stage, i) => {
              if (i === index) {
                return { ...stage, status: 'completed' };
              }
              return stage;
            })
          );
          
          // End processing after all stages complete
          if (index === stages.length - 1) {
            setTimeout(() => setIsProcessing(false), 1000);
          }
        }, 2000);
      }, index * 3000);
    });
  };

  return (
    <div className="pipeline-visualizer card">
      <h2 className="mb-4">AI Thought Pipeline</h2>
      
      <div className="mb-4">
        <textarea
          className="input"
          rows={4}
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="Enter your thought to process through the AI pipeline..."
          disabled={isProcessing}
        />
      </div>
      
      <button 
        className={`btn ${isProcessing ? 'btn-outline' : 'btn-primary'} mb-4`}
        onClick={handleProcess}
        disabled={isProcessing || status !== 'connected' || !thought.trim()}
      >
        {isProcessing ? 'Processing...' : 'Process Thought'}
      </button>
      
      <div className="pipeline-stages">
        {stages.map((stage, index) => (
          <div 
            key={index} 
            className={`pipeline-stage ${stage.status === 'processing' ? 'pulse' : ''}`}
            style={{
              borderLeftColor: 
                stage.status === 'completed' ? 'var(--success)' : 
                stage.status === 'processing' ? 'var(--accent)' : 
                stage.status === 'error' ? 'var(--error)' : 
                'var(--card-border)'
            }}
          >
            <h4 className="mb-2">{stage.name}</h4>
            <p className="text-sm mb-2">{stage.description}</p>
            <div className="models">
              {stage.models.map((model, idx) => (
                <span key={idx} className="model-badge">{model}</span>
              ))}
            </div>
            <div className="mt-2 text-sm">
              Status: {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
