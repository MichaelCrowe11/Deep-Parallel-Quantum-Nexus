import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useParams, useLocation } from 'wouter';
import { 
  Settings, 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  ArrowDown, 
  ArrowUp, 
  Copy, 
  RotateCcw,
  Layers,
  Cpu,
  GitBranch,
  Cog,
  SplitSquareVertical,
  Hand,
  Gauge,
  AlertCircle,
  X,
  Check,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Service types from the pipeline orchestration system
const serviceTypes = [
  'text_generation',
  'image_generation',
  'video_generation',
  'embeddings',
  'audio_generation',
  'audio_transcription',
  'language_understanding',
  'search'
];

// Fallback strategy types
const fallbackStrategyTypes = [
  'alternative-service',
  'simplified-prompt',
  'cache',
  'local-model',
  'none'
];

// Stage schema for form validation
const stageSchema = z.object({
  id: z.string().min(1, 'Stage ID is required'),
  name: z.string().min(1, 'Stage name is required'),
  description: z.string().optional(),
  serviceType: z.string().min(1, 'Service type is required'),
  required: z.boolean().default(true),
  input: z.object({
    type: z.string().min(1, 'Input type is required'),
    from: z.string().optional(),
    default: z.any().optional()
  }).optional(),
  output: z.object({
    type: z.string().min(1, 'Output type is required')
  }).optional(),
  fallbackStrategy: z.object({
    type: z.string(),
    services: z.array(z.string()).optional(),
    threshold: z.number().optional(),
    maxAttempts: z.number().optional()
  }).optional(),
  timeout: z.number().optional(),
  retryConfig: z.object({
    maxAttempts: z.number(),
    initialDelayMs: z.number(),
    backoffMultiplier: z.number(),
    maxDelayMs: z.number()
  }).optional()
});

// Pipeline configuration schema
const pipelineConfigSchema = z.object({
  name: z.string().min(3, 'Pipeline name must be at least 3 characters'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  stages: z.array(stageSchema).min(1, 'At least one stage is required'),
  routingRules: z.object({
    preferredProviders: z.record(z.array(z.string())).optional(),
    selectionCriteria: z.record(z.object({
      qualityFactor: z.number().min(0).max(1),
      speedFactor: z.number().min(0).max(1),
      costFactor: z.number().min(0).max(1)
    })).optional()
  }).optional(),
  fallbackConfig: z.object({
    globalMaxAttempts: z.number().optional(),
    fallbackProviders: z.record(z.array(z.string())).optional()
  }).optional()
});

// Component for editing a single pipeline stage
const StageEditor = ({ 
  stage, 
  onChange, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast, 
  allStages, 
  services
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Get available stage IDs for input source selection
  const availableInputSources = allStages
    .filter(s => s.id !== stage.id)
    .map(s => s.id);
    
  // Get services by type for this stage
  const servicesByType = services.filter(
    service => service.serviceType === stage.serviceType
  );
  
  return (
    <Card className="mb-4 border-primary/20 relative">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/30 rounded-l-lg"></div>
      
      <CardHeader className="pb-2 flex flex-row items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center font-mono text-xs">
              {allStages.findIndex(s => s.id === stage.id) + 1}
            </Badge>
            <CardTitle className="text-lg">{stage.name || 'New Stage'}</CardTitle>
            {stage.required ? (
              <Badge>Required</Badge>
            ) : (
              <Badge variant="outline">Optional</Badge>
            )}
            <Badge variant="secondary">{stage.serviceType}</Badge>
          </div>
          {stage.description && (
            <CardDescription>{stage.description}</CardDescription>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onMoveUp} 
            disabled={isFirst} 
            className="h-8 w-8"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onMoveDown} 
            disabled={isLast} 
            className="h-8 w-8"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setExpanded(!expanded)} 
            className="h-8 w-8"
          >
            {expanded ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={onDelete} 
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`stage-id-${stage.id}`}>Stage ID</Label>
              <Input 
                id={`stage-id-${stage.id}`}
                value={stage.id} 
                onChange={(e) => onChange({...stage, id: e.target.value})}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier for this stage
              </p>
            </div>
            
            <div>
              <Label htmlFor={`stage-name-${stage.id}`}>Stage Name</Label>
              <Input 
                id={`stage-name-${stage.id}`}
                value={stage.name || ''} 
                onChange={(e) => onChange({...stage, name: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor={`stage-desc-${stage.id}`}>Description</Label>
              <Textarea 
                id={`stage-desc-${stage.id}`}
                value={stage.description || ''} 
                onChange={(e) => onChange({...stage, description: e.target.value})}
                className="h-20"
              />
            </div>
            
            <div>
              <Label htmlFor={`stage-type-${stage.id}`}>Service Type</Label>
              <Select 
                value={stage.serviceType} 
                onValueChange={(value) => onChange({...stage, serviceType: value})}
              >
                <SelectTrigger id={`stage-type-${stage.id}`}>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`stage-required-${stage.id}`}
                checked={stage.required}
                onCheckedChange={(checked) => 
                  onChange({...stage, required: checked === true})
                }
              />
              <Label htmlFor={`stage-required-${stage.id}`}>Required stage</Label>
            </div>
            
            <div className="md:col-span-2">
              <Separator className="my-4" />
              <h4 className="text-sm font-medium mb-3">Input Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`stage-input-type-${stage.id}`}>Input Type</Label>
                  <Input
                    id={`stage-input-type-${stage.id}`}
                    value={stage.input?.type || ''}
                    onChange={(e) => onChange({
                      ...stage, 
                      input: {...(stage.input || {}), type: e.target.value}
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    e.g., string, json, image
                  </p>
                </div>
                
                <div>
                  <Label htmlFor={`stage-input-from-${stage.id}`}>Input Source</Label>
                  <Select 
                    value={stage.input?.from || ''}
                    onValueChange={(value) => onChange({
                      ...stage, 
                      input: {...(stage.input || {}), from: value}
                    })}
                  >
                    <SelectTrigger id={`stage-input-from-${stage.id}`}>
                      <SelectValue placeholder="Select input source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Direct Input</SelectItem>
                      {availableInputSources.map(sourceId => (
                        <SelectItem key={sourceId} value={sourceId}>
                          {sourceId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stage that provides input to this stage
                  </p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Separator className="my-4" />
              <h4 className="text-sm font-medium mb-3">Output Configuration</h4>
              
              <div>
                <Label htmlFor={`stage-output-type-${stage.id}`}>Output Type</Label>
                <Input
                  id={`stage-output-type-${stage.id}`}
                  value={stage.output?.type || ''}
                  onChange={(e) => onChange({
                    ...stage, 
                    output: {...(stage.output || {}), type: e.target.value}
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  e.g., json, image, text
                </p>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Separator className="my-4" />
              <h4 className="text-sm font-medium mb-3">Fallback Strategy</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`stage-fallback-type-${stage.id}`}>Fallback Type</Label>
                  <Select 
                    value={stage.fallbackStrategy?.type || 'none'}
                    onValueChange={(value) => onChange({
                      ...stage, 
                      fallbackStrategy: {...(stage.fallbackStrategy || {}), type: value}
                    })}
                  >
                    <SelectTrigger id={`stage-fallback-type-${stage.id}`}>
                      <SelectValue placeholder="Select fallback type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fallbackStrategyTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`stage-fallback-attempts-${stage.id}`}>Max Attempts</Label>
                  <Input
                    id={`stage-fallback-attempts-${stage.id}`}
                    type="number"
                    min="0"
                    value={stage.fallbackStrategy?.maxAttempts || ''}
                    onChange={(e) => onChange({
                      ...stage, 
                      fallbackStrategy: {
                        ...(stage.fallbackStrategy || {}), 
                        maxAttempts: parseInt(e.target.value) || undefined
                      }
                    })}
                  />
                </div>
              </div>
              
              {stage.fallbackStrategy?.type === 'alternative-service' && (
                <div className="mt-4">
                  <Label>Alternative Services</Label>
                  <div className="bg-muted/40 rounded-md p-3 mt-1">
                    {servicesByType.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No services available for this type
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {servicesByType.map(service => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`service-${service.id}`}
                              checked={(stage.fallbackStrategy?.services || []).includes(service.serviceName)}
                              onCheckedChange={(checked) => {
                                const services = [...(stage.fallbackStrategy?.services || [])];
                                if (checked) {
                                  if (!services.includes(service.serviceName)) {
                                    services.push(service.serviceName);
                                  }
                                } else {
                                  const index = services.indexOf(service.serviceName);
                                  if (index !== -1) {
                                    services.splice(index, 1);
                                  }
                                }
                                onChange({
                                  ...stage, 
                                  fallbackStrategy: {
                                    ...(stage.fallbackStrategy || {}), 
                                    services
                                  }
                                });
                              }}
                            />
                            <Label htmlFor={`service-${service.id}`} className="text-sm">
                              {service.serviceName}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
      
      {!expanded && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Input:</span>
              <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">
                {stage.input?.type || 'any'}
                {stage.input?.from && <span className="ml-1 opacity-70">from: {stage.input.from}</span>}
              </code>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Output:</span>
              <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">
                {stage.output?.type || 'any'}
              </code>
            </div>
            
            {stage.fallbackStrategy?.type && stage.fallbackStrategy.type !== 'none' && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Fallback:</span>
                <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">
                  {stage.fallbackStrategy.type.replace('-', ' ')}
                  {stage.fallbackStrategy.maxAttempts && 
                    <span className="ml-1 opacity-70">({stage.fallbackStrategy.maxAttempts} attempts)</span>
                  }
                </code>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Main Pipeline Configuration Component
const PipelineConfig = () => {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const isNewPipeline = !params.id;
  
  // Default empty pipeline
  const defaultPipeline = {
    name: 'New Pipeline',
    description: 'Custom pipeline configuration',
    isDefault: false,
    isActive: true,
    stages: [],
    routingRules: {
      preferredProviders: {},
      selectionCriteria: {}
    },
    fallbackConfig: {
      globalMaxAttempts: 3,
      fallbackProviders: {}
    }
  };
  
  // State for the pipeline being edited
  const [pipeline, setPipeline] = useState(defaultPipeline);
  
  // Load existing pipeline if editing
  const { data: existingPipeline, isLoading: isLoadingPipeline } = useQuery({
    queryKey: [`/api/pipelines/${params.id}`],
    enabled: !isNewPipeline,
    onSuccess: (data) => {
      if (data) {
        setPipeline(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to load pipeline",
        description: error.message,
        variant: "destructive",
      });
      // Navigate back to pipeline list
      setLocation('/pipelines');
    },
  });
  
  // Load services for service selection
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    select: (data) => data || [],
  });
  
  // Form for general pipeline info
  const form = useForm({
    resolver: zodResolver(pipelineConfigSchema),
    defaultValues: pipeline,
    values: pipeline,
  });
  
  // Update form values when pipeline changes
  useEffect(() => {
    form.reset(pipeline);
  }, [pipeline, form]);
  
  // Add a new stage
  const addStage = () => {
    // Generate a unique ID
    const existingIds = pipeline.stages.map(s => s.id);
    let newId = 'stage-' + (pipeline.stages.length + 1);
    while (existingIds.includes(newId)) {
      newId = 'stage-' + (Math.floor(Math.random() * 1000));
    }
    
    const newStage = {
      id: newId,
      name: 'New Stage',
      description: '',
      serviceType: 'text_generation',
      required: true,
      input: {
        type: 'string'
      },
      output: {
        type: 'json'
      }
    };
    
    setPipeline({
      ...pipeline,
      stages: [...pipeline.stages, newStage]
    });
  };
  
  // Update a stage
  const updateStage = (stageId, updatedStage) => {
    setPipeline({
      ...pipeline,
      stages: pipeline.stages.map(stage => 
        stage.id === stageId ? updatedStage : stage
      )
    });
  };
  
  // Delete a stage
  const deleteStage = (stageId) => {
    setPipeline({
      ...pipeline,
      stages: pipeline.stages.filter(stage => stage.id !== stageId)
    });
  };
  
  // Move a stage up
  const moveStageUp = (stageId) => {
    const stageIndex = pipeline.stages.findIndex(s => s.id === stageId);
    if (stageIndex <= 0) return;
    
    const newStages = [...pipeline.stages];
    const temp = newStages[stageIndex];
    newStages[stageIndex] = newStages[stageIndex - 1];
    newStages[stageIndex - 1] = temp;
    
    setPipeline({
      ...pipeline,
      stages: newStages
    });
  };
  
  // Move a stage down
  const moveStageDown = (stageId) => {
    const stageIndex = pipeline.stages.findIndex(s => s.id === stageId);
    if (stageIndex >= pipeline.stages.length - 1) return;
    
    const newStages = [...pipeline.stages];
    const temp = newStages[stageIndex];
    newStages[stageIndex] = newStages[stageIndex + 1];
    newStages[stageIndex + 1] = temp;
    
    setPipeline({
      ...pipeline,
      stages: newStages
    });
  };
  
  // Handle updating fields on the pipeline
  const handlePipelineFieldChange = (field, value) => {
    setPipeline({
      ...pipeline,
      [field]: value
    });
  };
  
  // Create pipeline mutation
  const createPipelineMutation = useMutation({
    mutationFn: async (pipelineData) => {
      const response = await apiRequest(
        'POST',
        '/api/pipelines',
        pipelineData
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pipeline created",
        description: `Pipeline "${data.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      setLocation('/pipelines');
    },
    onError: (error) => {
      toast({
        title: "Failed to create pipeline",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update pipeline mutation
  const updatePipelineMutation = useMutation({
    mutationFn: async (pipelineData) => {
      const response = await apiRequest(
        'PUT',
        `/api/pipelines/${params.id}`,
        pipelineData
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pipeline updated",
        description: `Pipeline "${data.name}" has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      queryClient.invalidateQueries({ queryKey: [`/api/pipelines/${params.id}`] });
      setLocation('/pipelines');
    },
    onError: (error) => {
      toast({
        title: "Failed to update pipeline",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete pipeline mutation
  const deletePipelineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'DELETE',
        `/api/pipelines/${params.id}`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pipeline deleted",
        description: "The pipeline has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      setLocation('/pipelines');
    },
    onError: (error) => {
      toast({
        title: "Failed to delete pipeline",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data) => {
    if (isNewPipeline) {
      createPipelineMutation.mutate(data);
    } else {
      updatePipelineMutation.mutate(data);
    }
  };
  
  if (isLoadingPipeline && !isNewPipeline) {
    return (
      <div className="container p-4 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Loading Pipeline...</h1>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="text-muted-foreground">Loading pipeline configuration</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container p-4 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/pipelines')}
            className="flex gap-2 items-center"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNewPipeline ? 'Create Pipeline' : 'Edit Pipeline'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isNewPipeline 
                ? 'Configure a new AI processing pipeline' 
                : 'Modify an existing pipeline configuration'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isNewPipeline && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Pipeline
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the pipeline "{pipeline.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deletePipelineMutation.mutate()}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createPipelineMutation.isPending || updatePipelineMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {isNewPipeline ? 'Create Pipeline' : 'Save Changes'}
            {(createPipelineMutation.isPending || updatePipelineMutation.isPending) && (
              <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Settings</CardTitle>
              <CardDescription>
                Configure basic pipeline properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pipeline Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Pipeline is available for execution
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Default Pipeline</FormLabel>
                            <FormDescription>
                              Used when no specific pipeline is specified
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Default Routing Rules</CardTitle>
              <CardDescription>
                Configure service selection criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Selection Criteria</h3>
                  
                  {serviceTypes.map(type => (
                    <div key={type} className="rounded-lg border p-3 shadow-sm mb-3">
                      <Label className="mb-2 block">{type.replace('_', ' ')}</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Quality</Label>
                          <Input 
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            className="text-sm"
                            value={
                              pipeline.routingRules?.selectionCriteria?.[type]?.qualityFactor || ''
                            }
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setPipeline({
                                ...pipeline,
                                routingRules: {
                                  ...pipeline.routingRules,
                                  selectionCriteria: {
                                    ...pipeline.routingRules?.selectionCriteria,
                                    [type]: {
                                      ...(pipeline.routingRules?.selectionCriteria?.[type] || {}),
                                      qualityFactor: isNaN(value) ? 0 : value
                                    }
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Speed</Label>
                          <Input 
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            className="text-sm"
                            value={
                              pipeline.routingRules?.selectionCriteria?.[type]?.speedFactor || ''
                            }
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setPipeline({
                                ...pipeline,
                                routingRules: {
                                  ...pipeline.routingRules,
                                  selectionCriteria: {
                                    ...pipeline.routingRules?.selectionCriteria,
                                    [type]: {
                                      ...(pipeline.routingRules?.selectionCriteria?.[type] || {}),
                                      speedFactor: isNaN(value) ? 0 : value
                                    }
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Cost</Label>
                          <Input 
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            className="text-sm"
                            value={
                              pipeline.routingRules?.selectionCriteria?.[type]?.costFactor || ''
                            }
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setPipeline({
                                ...pipeline,
                                routingRules: {
                                  ...pipeline.routingRules,
                                  selectionCriteria: {
                                    ...pipeline.routingRules?.selectionCriteria,
                                    [type]: {
                                      ...(pipeline.routingRules?.selectionCriteria?.[type] || {}),
                                      costFactor: isNaN(value) ? 0 : value
                                    }
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pipeline Stages Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Pipeline Stages</CardTitle>
                <CardDescription>
                  Configure the processing stages for this pipeline
                </CardDescription>
              </div>
              <Button onClick={addStage}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stage
              </Button>
            </CardHeader>
            <CardContent>
              {pipeline.stages.length === 0 ? (
                <div className="neural-pattern rounded-lg flex items-center justify-center h-64 text-center p-6">
                  <div className="max-w-md">
                    <Layers size={48} className="mx-auto text-primary/60 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Stages Defined</h2>
                    <p className="text-muted-foreground">
                      Add processing stages to build your pipeline. Each stage represents a 
                      step in the AI processing workflow.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={addStage}>
                      <Plus size={16} className="mr-2" />
                      Add First Stage
                    </Button>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[calc(80vh-8rem)]">
                  <div className="pr-4">
                    {pipeline.stages.map((stage, index) => (
                      <StageEditor
                        key={stage.id}
                        stage={stage}
                        onChange={(updatedStage) => updateStage(stage.id, updatedStage)}
                        onDelete={() => deleteStage(stage.id)}
                        onMoveUp={() => moveStageUp(stage.id)}
                        onMoveDown={() => moveStageDown(stage.id)}
                        isFirst={index === 0}
                        isLast={index === pipeline.stages.length - 1}
                        allStages={pipeline.stages}
                        services={services}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            {pipeline.stages.length > 0 && (
              <CardFooter className="flex justify-center border-t border-primary/10 py-4">
                <Button variant="outline" onClick={addStage}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stage
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PipelineConfig;