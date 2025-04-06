import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { 
  Settings, 
  Play, 
  List, 
  Plus, 
  FileJson, 
  MoreHorizontal,
  ChevronRight,
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  Filter,
  Search,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { queryClient, apiRequest } from '@/lib/queryClient';
import PipelineVisualizer from '@/components/pipeline-visualizer';

const PipelineManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPipeline, setSelectedPipeline] = useState<number | null>(null);

  // Fetch all pipeline configurations
  const { data: pipelines = [], isLoading: isLoadingPipelines } = useQuery({
    queryKey: ['/api/pipelines'],
    select: (data) => data || [],
  });

  // Fetch services for registry display
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    select: (data) => data || [],
  });

  // Fetch pipeline executions if a pipeline is selected
  const { data: executions = [], isLoading: isLoadingExecutions } = useQuery({
    queryKey: ['/api/pipeline-executions', selectedPipeline],
    enabled: !!selectedPipeline,
    select: (data) => data || [],
  });

  // Mutation for executing a pipeline
  const executePipelineMutation = useMutation({
    mutationFn: async ({ pipelineId, input }: { pipelineId: number, input: string }) => {
      const response = await apiRequest(
        'POST',
        '/api/pipelines/execute',
        { pipelineId, input }
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pipeline execution started",
        description: `Execution ID: ${data.executionId}`,
      });
      // Refetch executions after starting a new one
      queryClient.invalidateQueries({ queryKey: ['/api/pipeline-executions', selectedPipeline] });
    },
    onError: (error) => {
      toast({
        title: "Failed to execute pipeline",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter pipelines based on search query and active tab
  const filteredPipelines = pipelines.filter((pipeline) => {
    // Search filter
    const matchesSearch = 
      pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pipeline.description && pipeline.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Tab filter
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'active' && pipeline.isActive) ||
      (activeTab === 'default' && pipeline.isDefault);
    
    return matchesSearch && matchesTab;
  });

  const handleExecutePipeline = (pipelineId: number) => {
    executePipelineMutation.mutate({
      pipelineId,
      input: "This is a test thought for the pipeline to process" // In a real app, this would be user input
    });
  };

  const handlePipelineSelect = (pipelineId: number) => {
    setSelectedPipeline(pipelineId);
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline Management</h1>
          <p className="text-muted-foreground mt-1">Configure and monitor AI processing pipelines</p>
        </div>
        <Link href="/pipelines/new">
          <Button className="gap-2">
            <Plus size={16} />
            <span>New Pipeline</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline List Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="space-y-1 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Pipelines</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Import Configuration</DropdownMenuItem>
                    <DropdownMenuItem>Export All</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Refresh</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                Manage your AI processing pipelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search pipelines..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter size={16} />
                </Button>
                <Button variant="outline" size="icon">
                  <ArrowDownUp size={16} />
                </Button>
              </div>
              
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="default">Default</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoadingPipelines ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-12 w-12 rounded-full bg-accent/10"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-accent/10 rounded w-3/4"></div>
                      <div className="h-4 bg-accent/10 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : filteredPipelines.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <div className="mb-2">
                    <FileJson className="h-12 w-12 mx-auto text-muted-foreground/40" />
                  </div>
                  <h3 className="font-medium">No pipelines found</h3>
                  <p className="text-sm">
                    {searchQuery 
                      ? `No results match '${searchQuery}'` 
                      : "Create a new pipeline to get started"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 mt-2">
                  {filteredPipelines.map((pipeline) => (
                    <div 
                      key={pipeline.id}
                      className={`flex items-center justify-between p-2 rounded-md hover:bg-accent/10 cursor-pointer transition-colors ${
                        selectedPipeline === pipeline.id ? 'bg-accent/20' : ''
                      }`}
                      onClick={() => handlePipelineSelect(pipeline.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Settings size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-sm">{pipeline.name}</h4>
                            {pipeline.isDefault && (
                              <Badge variant="outline" className="ml-2 px-1.5 py-0">Default</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {pipeline.stages?.length || 0} stages
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecutePipeline(pipeline.id);
                          }}
                        >
                          <Play size={14} />
                        </Button>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Details Panel */}
        <div className="lg:col-span-2">
          {selectedPipeline ? (
            <Tabs defaultValue="details">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="details">Pipeline Details</TabsTrigger>
                <TabsTrigger value="executions">Executions</TabsTrigger>
                <TabsTrigger value="services">Service Registry</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                {pipelines.find(p => p.id === selectedPipeline) && (
                  <PipelineDetailsView 
                    pipeline={pipelines.find(p => p.id === selectedPipeline)!} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="executions" className="mt-4">
                <PipelineExecutionsView 
                  executions={executions} 
                  isLoading={isLoadingExecutions} 
                  pipelineId={selectedPipeline}
                />
              </TabsContent>
              
              <TabsContent value="services" className="mt-4">
                <ServiceRegistryView 
                  services={services} 
                  isLoading={isLoadingServices} 
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="neural-pattern rounded-lg flex items-center justify-center h-96 text-center p-6">
              <div className="max-w-md">
                <Settings size={48} className="mx-auto text-primary/60 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Select a Pipeline</h2>
                <p className="text-muted-foreground">
                  Choose a pipeline from the list to view its details, monitor executions, or configure services.
                </p>
                <div className="mt-4">
                  <Link href="/pipelines/new">
                    <Button variant="outline" className="mr-2">
                      <Plus size={16} className="mr-2" />
                      Create Pipeline
                    </Button>
                  </Link>
                  <Button variant="secondary">
                    <FileJson size={16} className="mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PipelineDetailsViewProps {
  pipeline: any;
}

const PipelineDetailsView: React.FC<PipelineDetailsViewProps> = ({ pipeline }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center">
              {pipeline.name}
              {pipeline.isDefault && (
                <Badge variant="outline" className="ml-2">Default</Badge>
              )}
              {pipeline.isActive ? (
                <Badge variant="secondary" className="ml-2">Active</Badge>
              ) : (
                <Badge variant="outline" className="ml-2 bg-destructive/10 text-destructive border-destructive/20">Inactive</Badge>
              )}
            </CardTitle>
            <CardDescription>{pipeline.description}</CardDescription>
          </div>
          <div>
            <Link href={`/pipelines/${pipeline.id}/edit`}>
              <Button variant="outline" size="sm" className="ml-2">
                <Settings size={16} className="mr-1" />
                Edit
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Pipeline ID</h4>
                <p className="text-sm text-muted-foreground">{pipeline.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(pipeline.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(pipeline.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">User ID</h4>
                <p className="text-sm text-muted-foreground">{pipeline.userId || 'System'}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Pipeline Visualization</h3>
              <PipelineVisualizer showDetails={true} className="bg-accent/5" />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Pipeline Stages</h3>
                <Badge variant="outline" className="font-mono">
                  {pipeline.stages?.length || 0} stages
                </Badge>
              </div>
              
              <div className="space-y-3">
                {pipeline.stages && pipeline.stages.map((stage: any, index: number) => (
                  <Card key={stage.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-1.5 bg-primary/60"></div>
                      <div className="p-4 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {index + 1}
                            </Badge>
                            <h4 className="font-medium">{stage.name}</h4>
                            {stage.required ? (
                              <Badge variant="default" className="text-xs">Required</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Optional</Badge>
                            )}
                          </div>
                          <Badge className="bg-accent/20 hover:bg-accent/30 text-accent-foreground">
                            {stage.serviceType}
                          </Badge>
                        </div>
                        
                        {stage.description && (
                          <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="text-xs">
                            <span className="font-medium">Input:</span>{' '}
                            <code className="rounded bg-muted px-1 py-0.5">
                              {stage.input?.type || 'any'}
                              {stage.input?.from ? ` (from: ${stage.input.from})` : ''}
                            </code>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Output:</span>{' '}
                            <code className="rounded bg-muted px-1 py-0.5">
                              {stage.output?.type || 'any'}
                            </code>
                          </div>
                        </div>
                        
                        {stage.fallbackStrategy && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Fallback:</span>{' '}
                            <code className="rounded bg-muted px-1 py-0.5">
                              {stage.fallbackStrategy.type}
                              {stage.fallbackStrategy.maxAttempts && ` (max attempts: ${stage.fallbackStrategy.maxAttempts})`}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {pipeline.routingRules && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-3">Routing Rules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="text-sm font-medium mb-2">Preferred Providers</h4>
                      {Object.entries(pipeline.routingRules.preferredProviders).map(([type, providers]: [string, any]) => (
                        <div key={type} className="mb-2 last:mb-0">
                          <div className="text-xs font-medium text-muted-foreground mb-1">{type}</div>
                          <div className="flex flex-wrap gap-1">
                            {providers.map((provider: string) => (
                              <Badge key={provider} variant="outline" className="text-xs">
                                {provider}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="text-sm font-medium mb-2">Selection Criteria</h4>
                      {Object.entries(pipeline.routingRules.selectionCriteria).map(([type, criteria]: [string, any]) => (
                        <div key={type} className="mb-2 last:mb-0">
                          <div className="text-xs font-medium text-muted-foreground mb-1">{type}</div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="text-xs">
                              <span className="inline-block w-8">Quality:</span> {criteria.qualityFactor}
                            </div>
                            <div className="text-xs">
                              <span className="inline-block w-8">Speed:</span> {criteria.speedFactor}
                            </div>
                            <div className="text-xs">
                              <span className="inline-block w-8">Cost:</span> {criteria.costFactor}
                            </div>
                          </div>
                        </div>
                      ))}
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button variant="outline" className="w-full">
            <FileJson className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Link href={`/pipelines/${pipeline.id}/edit`} className="w-full">
            <Button variant="default" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Edit Pipeline
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

interface PipelineExecutionsViewProps {
  executions: any[];
  isLoading: boolean;
  pipelineId: number;
}

const PipelineExecutionsView: React.FC<PipelineExecutionsViewProps> = ({ 
  executions, 
  isLoading,
  pipelineId
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>Pipeline execution records and results</CardDescription>
          </div>
          <Button size="sm">
            <Play size={14} className="mr-2" />
            Execute
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-accent/10 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-accent/10 rounded"></div>
                  <div className="h-4 bg-accent/10 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : executions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <div className="mb-2">
              <List className="h-12 w-12 mx-auto text-muted-foreground/40" />
            </div>
            <h3 className="font-medium">No executions found</h3>
            <p className="text-sm">
              This pipeline hasn't been executed yet
            </p>
            <Button variant="outline" className="mt-4">
              <Play size={14} className="mr-2" />
              Run Pipeline
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id} className="overflow-hidden">
                <div className={`h-1 ${
                  execution.status === 'completed' ? 'bg-green-500' :
                  execution.status === 'failed' ? 'bg-red-500' :
                  execution.status === 'running' ? 'bg-blue-500' : 'bg-gray-500'
                }`}></div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Execution #{execution.id}</h4>
                      <Badge variant={
                        execution.status === 'completed' ? 'default' :
                        execution.status === 'failed' ? 'destructive' :
                        execution.status === 'running' ? 'secondary' : 'outline'
                      }>
                        {execution.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(execution.startedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <h4 className="text-xs font-medium mb-1">Input</h4>
                      <div className="rounded bg-muted p-2 text-xs font-mono overflow-auto max-h-20">
                        {execution.inputData ? JSON.stringify(execution.inputData, null, 2) : 'No input data'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium mb-1">Output</h4>
                      <div className="rounded bg-muted p-2 text-xs font-mono overflow-auto max-h-20">
                        {execution.outputData ? JSON.stringify(execution.outputData, null, 2) : 'No output data'}
                      </div>
                    </div>
                  </div>
                  
                  {execution.status === 'failed' && execution.error && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium mb-1 text-destructive">Error</h4>
                      <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                        {typeof execution.error === 'string' 
                          ? execution.error 
                          : JSON.stringify(execution.error, null, 2)}
                      </div>
                    </div>
                  )}
                  
                  {execution.executionMetrics && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium mb-1">Metrics</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="rounded bg-muted px-2 py-1">
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="text-sm font-medium">
                            {execution.executionMetrics.totalDuration || 0}ms
                          </div>
                        </div>
                        <div className="rounded bg-muted px-2 py-1">
                          <div className="text-xs text-muted-foreground">Stages</div>
                          <div className="text-sm font-medium">
                            {execution.executionMetrics.completedStages || 0}/
                            {execution.executionMetrics.totalStages || 0}
                          </div>
                        </div>
                        <div className="rounded bg-muted px-2 py-1">
                          <div className="text-xs text-muted-foreground">Tokens</div>
                          <div className="text-sm font-medium">
                            {execution.executionMetrics.tokensUsed || 0}
                          </div>
                        </div>
                        <div className="rounded bg-muted px-2 py-1">
                          <div className="text-xs text-muted-foreground">Attempts</div>
                          <div className="text-sm font-medium">
                            {execution.executionMetrics.totalAttempts || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ServiceRegistryViewProps {
  services: any[];
  isLoading: boolean;
}

const ServiceRegistryView: React.FC<ServiceRegistryViewProps> = ({ 
  services, 
  isLoading 
}) => {
  const serviceTypes = Array.from(
    new Set(services.map(service => service.serviceType))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Service Registry</CardTitle>
            <CardDescription>Available AI services for pipeline execution</CardDescription>
          </div>
          <Button size="sm">
            <Plus size={14} className="mr-2" />
            Register Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-accent/10 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-accent/10 rounded"></div>
                  <div className="h-4 bg-accent/10 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <div className="mb-2">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground/40" />
            </div>
            <h3 className="font-medium">No services registered</h3>
            <p className="text-sm">
              Register AI services to use in your pipelines
            </p>
            <Button variant="outline" className="mt-4">
              <Plus size={14} className="mr-2" />
              Register Service
            </Button>
          </div>
        ) : (
          <Tabs defaultValue={serviceTypes[0] || 'all'}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {serviceTypes.map(type => (
                <TabsTrigger key={type} value={type}>
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <div className="space-y-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </TabsContent>
            
            {serviceTypes.map(type => (
              <TabsContent key={type} value={type}>
                <div className="space-y-4">
                  {services
                    .filter(service => service.serviceType === type)
                    .map(service => (
                      <ServiceCard key={service.id} service={service} />
                    ))
                  }
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

interface ServiceCardProps {
  service: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className={`w-1 ${
          service.healthStatus === 'healthy' ? 'bg-green-500' :
          service.healthStatus === 'degraded' ? 'bg-yellow-500' :
          service.healthStatus === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
        }`}></div>
        <div className="p-4 w-full">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{service.serviceName}</h4>
                <Badge variant="outline">{service.serviceType}</Badge>
                {service.isActive ? (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">Provider: {service.providerId}</p>
                <p className="text-xs text-muted-foreground">Priority: {service.priority}</p>
                {service.apiVersion && (
                  <p className="text-xs text-muted-foreground">API Version: {service.apiVersion}</p>
                )}
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs ${
                    service.healthStatus === 'healthy' ? 'bg-green-500/10 text-green-600' :
                    service.healthStatus === 'degraded' ? 'bg-yellow-500/10 text-yellow-600' :
                    service.healthStatus === 'unhealthy' ? 'bg-red-500/10 text-red-600' : 'bg-gray-500/10 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      service.healthStatus === 'healthy' ? 'bg-green-500' :
                      service.healthStatus === 'degraded' ? 'bg-yellow-500' :
                      service.healthStatus === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    {service.healthStatus || 'unknown'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last health check: {service.lastHealthCheck ? new Date(service.lastHealthCheck).toLocaleString() : 'Never'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {service.capabilities && (
            <div className="mt-3">
              <h4 className="text-xs font-medium mb-1">Capabilities</h4>
              <div className="flex flex-wrap gap-1">
                {service.capabilities.map((capability: string) => (
                  <Badge key={capability} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {service.performanceMetrics && (
            <div className="mt-3">
              <h4 className="text-xs font-medium mb-1">Performance</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded bg-muted px-2 py-1">
                  <div className="text-xs text-muted-foreground">Response Time</div>
                  <div className="text-sm font-medium">
                    {service.performanceMetrics.avgResponseTime || 0}ms
                  </div>
                </div>
                <div className="rounded bg-muted px-2 py-1">
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                  <div className="text-sm font-medium">
                    {service.performanceMetrics.successRate || 0}%
                  </div>
                </div>
                <div className="rounded bg-muted px-2 py-1">
                  <div className="text-xs text-muted-foreground">Calls</div>
                  <div className="text-sm font-medium">
                    {service.performanceMetrics.totalCalls || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PipelineManagement;