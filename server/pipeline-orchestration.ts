/**
 * Pipeline Orchestration System
 * 
 * Provides flexible orchestration of AI services through configurable pipeline stages
 * with intelligent routing, fallback mechanisms, and performance optimization.
 */

import { storage } from './storage';
import { logger, LogLevel } from './logger';
import { 
  type PipelineConfiguration, 
  type ServiceRegistry, 
  type PipelineExecution 
} from '@shared/schema';

// Service Type Constants
export enum ServiceType {
  TEXT_GENERATION = 'text_generation',
  IMAGE_GENERATION = 'image_generation',
  VIDEO_GENERATION = 'video_generation',
  EMBEDDINGS = 'embeddings',
  AUDIO_GENERATION = 'audio_generation',
  AUDIO_TRANSCRIPTION = 'audio_transcription',
  LANGUAGE_UNDERSTANDING = 'language_understanding',
  SEARCH = 'search'
}

// Orchestration Configuration Types
export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  serviceType: ServiceType;
  required: boolean;
  input?: {
    type: string;
    from?: string;
    default?: any;
  };
  output?: {
    type: string;
  };
  parameters?: Record<string, any>;
  fallbackStrategy?: FallbackStrategy;
  timeout?: number;
  retryConfig?: RetryConfig;
}

export interface FallbackStrategy {
  type: 'alternative-service' | 'simplified-prompt' | 'cache' | 'local-model' | 'none';
  services?: string[];
  threshold?: number;
  maxAttempts?: number;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export interface RouteSelectionCriteria {
  priority?: number;
  costFactor?: number;
  qualityFactor?: number;
  speedFactor?: number;
}

// Orchestration Execution Types
export interface PipelineContext {
  pipelineId: number;
  executionId: number;
  input: any;
  output: Record<string, any>;
  metrics: Record<string, any>;
  errors: Record<string, any>;
  startTime: Date;
  currentStage?: string;
}

export interface StageExecutionResult {
  success: boolean;
  output?: any;
  error?: any;
  serviceUsed?: string;
  metrics: {
    duration: number;
    attempts: number;
    tokensUsed?: number;
    provider?: string;
    model?: string;
  };
}

/**
 * Initialize the pipeline orchestration system
 * Creates default pipeline configurations if needed
 */
export async function initializePipelineSystem(): Promise<boolean> {
  try {
    logger.info('Initializing Pipeline Orchestration System');
    
    // Check if we have a default pipeline configuration
    const defaultConfig = await storage.getDefaultPipelineConfiguration();
    
    if (!defaultConfig) {
      // Create default pipeline configuration
      await createDefaultPipelineConfiguration();
      logger.info('Created default pipeline configuration');
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize pipeline system', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
}

/**
 * Create a default pipeline configuration
 */
async function createDefaultPipelineConfiguration(): Promise<PipelineConfiguration> {
  const defaultStages: PipelineStage[] = [
    {
      id: 'initial-analysis',
      name: 'Initial Analysis',
      description: 'Analyze input content for core concepts and themes',
      serviceType: ServiceType.TEXT_GENERATION,
      required: true,
      input: {
        type: 'string'
      },
      output: {
        type: 'json'
      },
      fallbackStrategy: {
        type: 'alternative-service',
        maxAttempts: 3
      }
    },
    {
      id: 'pattern-recognition',
      name: 'Pattern Recognition',
      description: 'Identify patterns and structures in the content',
      serviceType: ServiceType.TEXT_GENERATION,
      required: true,
      input: {
        type: 'json',
        from: 'initial-analysis'
      },
      output: {
        type: 'json'
      },
      fallbackStrategy: {
        type: 'alternative-service',
        maxAttempts: 2
      }
    },
    {
      id: 'visual-concept-generation',
      name: 'Visual Concept Generation',
      description: 'Generate visual concepts from patterns',
      serviceType: ServiceType.TEXT_GENERATION,
      required: true,
      input: {
        type: 'json',
        from: 'pattern-recognition'
      },
      output: {
        type: 'json'
      }
    },
    {
      id: 'storyboard-creation',
      name: 'Storyboard Creation',
      description: 'Create storyboard from visual concepts',
      serviceType: ServiceType.TEXT_GENERATION,
      required: true,
      input: {
        type: 'json',
        from: 'visual-concept-generation'
      },
      output: {
        type: 'json'
      }
    },
    {
      id: 'scene-visualization',
      name: 'Scene Visualization',
      description: 'Generate visual representations of each scene',
      serviceType: ServiceType.IMAGE_GENERATION,
      required: true,
      input: {
        type: 'json',
        from: 'storyboard-creation'
      },
      output: {
        type: 'json'
      },
      fallbackStrategy: {
        type: 'alternative-service',
        maxAttempts: 3
      }
    },
    {
      id: 'scene-transition',
      name: 'Scene Transition Design',
      description: 'Design transitions between scenes',
      serviceType: ServiceType.TEXT_GENERATION,
      required: false,
      input: {
        type: 'json',
        from: 'storyboard-creation'
      },
      output: {
        type: 'json'
      }
    },
    {
      id: 'video-generation',
      name: 'Video Generation',
      description: 'Generate videos for scenes',
      serviceType: ServiceType.VIDEO_GENERATION,
      required: false,
      input: {
        type: 'json',
        from: 'scene-visualization'
      },
      output: {
        type: 'json'
      },
      fallbackStrategy: {
        type: 'none'
      }
    }
  ];
  
  const routingRules = {
    preferredProviders: {
      [ServiceType.TEXT_GENERATION]: ['anthropic', 'openai', 'mistral', 'perplexity'],
      [ServiceType.IMAGE_GENERATION]: ['openai', 'deepinfra'],
      [ServiceType.VIDEO_GENERATION]: ['runway', 'deepinfra']
    },
    selectionCriteria: {
      [ServiceType.TEXT_GENERATION]: {
        qualityFactor: 0.7,
        speedFactor: 0.2,
        costFactor: 0.1
      },
      [ServiceType.IMAGE_GENERATION]: {
        qualityFactor: 0.8,
        speedFactor: 0.1,
        costFactor: 0.1
      },
      [ServiceType.VIDEO_GENERATION]: {
        qualityFactor: 0.9,
        speedFactor: 0.05,
        costFactor: 0.05
      }
    }
  };
  
  const fallbackConfig = {
    globalMaxAttempts: 3,
    fallbackProviders: {
      [ServiceType.TEXT_GENERATION]: ['together', 'local'],
      [ServiceType.IMAGE_GENERATION]: ['stability', 'local'],
      [ServiceType.VIDEO_GENERATION]: ['deepinfra']
    }
  };
  
  return storage.createPipelineConfiguration({
    name: 'Default Pipeline',
    description: 'Default pipeline configuration for thought-to-visual processing',
    isDefault: true,
    isActive: true,
    userId: 1, // System user
    stages: defaultStages,
    routingRules,
    fallbackConfig
  });
}

/**
 * Run a pipeline with the specified configuration
 */
export async function runPipeline(
  pipelineConfigId: number | undefined,
  input: any,
  options?: {
    userId?: number;
    priority?: number;
    forceSync?: boolean;
  }
): Promise<{ executionId: number; result?: any; error?: any }> {
  try {
    // Get pipeline configuration
    const pipelineConfig = pipelineConfigId
      ? await storage.getPipelineConfiguration(pipelineConfigId)
      : await storage.getDefaultPipelineConfiguration();
    
    if (!pipelineConfig) {
      throw new Error('Pipeline configuration not found');
    }
    
    // Create pipeline execution record
    const execution = await storage.createPipelineExecution({
      pipelineId: pipelineConfig.id,
      status: 'pending',
      inputData: input,
      outputData: null,
      error: null,
      executionMetrics: {
        startTime: new Date(),
        priority: options?.priority || 0,
        userId: options?.userId,
        forceSync: options?.forceSync || false
      }
    });
    
    // If we need to run synchronously
    if (options?.forceSync) {
      try {
        const result = await executePipeline(pipelineConfig, execution.id, input);
        await storage.completePipelineExecution(execution.id, result.output, result.metrics);
        return { executionId: execution.id, result: result.output };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await storage.failPipelineExecution(execution.id, { message: errorMessage });
        return { executionId: execution.id, error: errorMessage };
      }
    }
    
    // Otherwise, run asynchronously
    // In a production environment, this would use a message queue or background job
    // For now, we'll just run it in a separate promise
    executePipeline(pipelineConfig, execution.id, input)
      .then(result => {
        storage.completePipelineExecution(execution.id, result.output, result.metrics);
      })
      .catch(error => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        storage.failPipelineExecution(execution.id, { message: errorMessage });
      });
    
    return { executionId: execution.id };
  } catch (error) {
    logger.error('Failed to run pipeline', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      pipelineConfigId,
      inputSummary: typeof input === 'string' ? input.substring(0, 100) + '...' : 'non-string input'
    });
    throw error;
  }
}

/**
 * Get pipeline execution status
 */
export async function getPipelineExecutionStatus(executionId: number): Promise<{
  status: string;
  output?: any;
  error?: any;
  metrics?: any;
}> {
  const execution = await storage.getPipelineExecution(executionId);
  
  if (!execution) {
    throw new Error('Pipeline execution not found');
  }
  
  return {
    status: execution.status,
    output: execution.outputData,
    error: execution.error,
    metrics: execution.executionMetrics
  };
}

/**
 * Execute a pipeline with the given configuration
 * This is the core orchestration function that:
 * 1. Executes each stage in sequence
 * 2. Routes to appropriate services
 * 3. Handles fallbacks
 * 4. Collects metrics
 */
async function executePipeline(
  pipelineConfig: PipelineConfiguration,
  executionId: number,
  input: any
): Promise<{
  output: Record<string, any>;
  metrics: Record<string, any>;
}> {
  // Initialize pipeline context
  const context: PipelineContext = {
    pipelineId: pipelineConfig.id,
    executionId,
    input,
    output: {},
    metrics: {
      stageResults: {},
      totalDuration: 0,
      servicesUsed: {},
      startTime: new Date(),
      endTime: null
    },
    errors: {},
    startTime: new Date()
  };
  
  logger.info(`Starting pipeline execution ${executionId}`, {
    pipelineId: pipelineConfig.id,
    executionId
  });
  
  const stages = pipelineConfig.stages as PipelineStage[];
  
  // Execute each stage in sequence
  for (const stage of stages) {
    context.currentStage = stage.id;
    
    logger.info(`Executing pipeline stage: ${stage.name}`, {
      pipelineId: pipelineConfig.id,
      executionId,
      stageId: stage.id
    });
    
    try {
      // Get stage input
      const stageInput = getStageInput(stage, context);
      
      // Execute the stage
      const result = await executeStage(stage, stageInput, pipelineConfig);
      
      // Store the result
      context.output[stage.id] = result.output;
      context.metrics.stageResults[stage.id] = result.metrics;
      
      // Track service usage
      const serviceKey = result.serviceUsed || 'unknown';
      context.metrics.servicesUsed[serviceKey] = (context.metrics.servicesUsed[serviceKey] || 0) + 1;
      
      logger.info(`Completed pipeline stage: ${stage.name}`, {
        pipelineId: pipelineConfig.id,
        executionId,
        stageId: stage.id,
        duration: result.metrics.duration,
        service: result.serviceUsed
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      context.errors[stage.id] = {
        message: errorMessage,
        timestamp: new Date()
      };
      
      logger.error(`Failed pipeline stage: ${stage.name}`, {
        pipelineId: pipelineConfig.id,
        executionId,
        stageId: stage.id,
        error: errorMessage
      });
      
      // If this stage is required, we need to throw to stop the pipeline
      if (stage.required) {
        throw new Error(`Required pipeline stage failed: ${stage.name}`);
      }
    }
  }
  
  // Calculate total duration
  const endTime = new Date();
  const totalDuration = endTime.getTime() - context.startTime.getTime();
  context.metrics.totalDuration = totalDuration;
  context.metrics.endTime = endTime;
  
  logger.info(`Completed pipeline execution ${executionId}`, {
    pipelineId: pipelineConfig.id,
    executionId,
    totalDuration,
    servicesUsed: Object.keys(context.metrics.servicesUsed).join(', ')
  });
  
  return {
    output: context.output,
    metrics: context.metrics
  };
}

/**
 * Get the input for a stage based on the pipeline context
 */
function getStageInput(stage: PipelineStage, context: PipelineContext): any {
  // If there's no input config, use the pipeline input
  if (!stage.input) {
    return context.input;
  }
  
  // If there's a specific source stage, use its output
  if (stage.input.from) {
    if (!context.output[stage.input.from]) {
      // If the source doesn't exist but there's a default, use that
      if ('default' in stage.input) {
        return stage.input.default;
      }
      throw new Error(`Stage input source not found: ${stage.input.from}`);
    }
    return context.output[stage.input.from];
  }
  
  // Otherwise, use the pipeline input
  return context.input;
}

/**
 * Execute a single pipeline stage
 */
async function executeStage(
  stage: PipelineStage, 
  input: any,
  pipelineConfig: PipelineConfiguration
): Promise<StageExecutionResult> {
  // For now, we'll just add a placeholder implementation
  // This will be expanded to handle actual service routing
  const startTime = Date.now();

  try {
    // Get appropriate services for this stage type
    const services = await getServicesForStage(stage, pipelineConfig);
    
    if (services.length === 0) {
      throw new Error(`No services available for stage type: ${stage.serviceType}`);
    }
    
    // Try each service in order until one succeeds
    let lastError: any = null;
    let attempts = 0;
    let serviceIndex = 0;
    let output: any = null;
    let serviceUsed: string = '';
    
    const maxAttempts = stage.fallbackStrategy?.maxAttempts || 
                       (pipelineConfig.fallbackConfig as any)?.globalMaxAttempts || 
                       1;
    
    while (attempts < maxAttempts && serviceIndex < services.length) {
      const service = services[serviceIndex];
      attempts++;
      
      try {
        // Here we would dispatch to the actual service
        // For now, we'll just simulate success
        output = await simulateServiceExecution(stage, input, service);
        serviceUsed = `${service.providerId}/${service.serviceName}`;
        break;
      } catch (error) {
        lastError = error;
        serviceIndex++;
        
        logger.warning(`Service failed for stage ${stage.id}, trying next service`, {
          stageId: stage.id,
          serviceId: service.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: attempts,
          maxAttempts
        });
      }
    }
    
    if (output === null) {
      throw lastError || new Error(`All services failed for stage: ${stage.id}`);
    }
    
    return {
      success: true,
      output,
      serviceUsed,
      metrics: {
        duration: Date.now() - startTime,
        attempts,
        provider: services[serviceIndex].providerId.toString(),
        model: services[serviceIndex].serviceName
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: {
        duration: Date.now() - startTime,
        attempts: 0
      }
    };
  }
}

/**
 * Get appropriate services for a stage based on type and configuration
 */
async function getServicesForStage(
  stage: PipelineStage,
  pipelineConfig: PipelineConfiguration
): Promise<ServiceRegistry[]> {
  // Get all services of the appropriate type
  const services = await storage.getServicesByType(stage.serviceType);
  
  if (services.length === 0) {
    return [];
  }
  
  // Apply routing rules from pipeline configuration
  const routingRules = pipelineConfig.routingRules as any;
  
  // If there are preferred providers for this service type, prioritize them
  const preferredProviders = routingRules?.preferredProviders?.[stage.serviceType] || [];
  
  if (preferredProviders.length > 0) {
    // Sort services by preferred providers
    services.sort((a, b) => {
      // Get provider names
      const providerAName = a.providerId.toString();
      const providerBName = b.providerId.toString();
      
      // Check if they're in the preferred list
      const indexA = preferredProviders.indexOf(providerAName);
      const indexB = preferredProviders.indexOf(providerBName);
      
      // If both are in the list, sort by their position
      if (indexA >= 0 && indexB >= 0) {
        return indexA - indexB;
      }
      
      // If only one is in the list, prioritize it
      if (indexA >= 0) return -1;
      if (indexB >= 0) return 1;
      
      // Otherwise, sort by priority (with null check)
      return (b.priority || 0) - (a.priority || 0);
    });
  }
  
  return services;
}

/**
 * Simulate execution of a service for a stage
 * In a real implementation, this would dispatch to the actual service
 */
async function simulateServiceExecution(
  stage: PipelineStage,
  input: any,
  service: ServiceRegistry
): Promise<any> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For now, just return a placeholder based on the stage
  switch (stage.serviceType) {
    case ServiceType.TEXT_GENERATION:
      return {
        generated_text: `Simulated text generation for stage: ${stage.name}`,
        input_summary: typeof input === 'string' 
          ? input.substring(0, 50) + '...' 
          : JSON.stringify(input).substring(0, 50) + '...'
      };
      
    case ServiceType.IMAGE_GENERATION:
      return {
        image_urls: [
          `https://placeholder.com/generated-image-1-${stage.id}.png`,
          `https://placeholder.com/generated-image-2-${stage.id}.png`
        ],
        prompts: [
          "Simulated image prompt 1",
          "Simulated image prompt 2"
        ]
      };
      
    case ServiceType.VIDEO_GENERATION:
      return {
        video_urls: [
          `https://placeholder.com/generated-video-${stage.id}.mp4`
        ],
        prompt: "Simulated video prompt"
      };
      
    default:
      return { result: "Simulated generic output" };
  }
}