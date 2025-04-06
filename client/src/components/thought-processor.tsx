import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lightbulb, 
  Loader2, 
  ArrowRight, 
  Brain, 
  Sparkles,
  Network,
  GitBranch,
  Boxes,
  Waypoints,
  Eye,
  GitBranchPlus,
  Braces
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Thought } from "@shared/schema";
import { IMAGES } from "@/config/assets"; 
import { FlowParallel } from "./icons";
import { ParallelProcessingPipeline, PipelineStage, defaultPipelineStages } from "./parallel-processing-pipeline";

interface ThoughtProcessorProps {
  projectId: number;
  thoughts: Thought[];
}

interface ResearchPrompt {
  prompt: string;
}

export default function ThoughtProcessor({ projectId, thoughts }: ThoughtProcessorProps) {
  const [content, setContent] = useState("");
  const [suggestedPrompt, setSuggestedPrompt] = useState("");
  const [processingStep, setProcessingStep] = useState<string>("");
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(defaultPipelineStages);
  const [activeStage, setActiveStage] = useState<string | undefined>(undefined);
  const [showPipeline, setShowPipeline] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch research prompt suggestions
  const { data: researchPrompt } = useQuery<ResearchPrompt>({
    queryKey: ["/api/research-prompts"],
    refetchInterval: false,
    enabled: !content,
  });

  useEffect(() => {
    if (researchPrompt?.prompt && !content) {
      setSuggestedPrompt(researchPrompt.prompt);
    }
  }, [researchPrompt, content]);

  const createThought = useMutation({
    mutationFn: async () => {
      setProcessingStep("Starting advanced thought analysis pipeline...");
      setShowPipeline(true);
      
      // Reset pipeline stages
      setPipelineStages(defaultPipelineStages);
      
      const res = await apiRequest("POST", "/api/thoughts", {
        projectId,
        content,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to process thought");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      setContent("");
      setSuggestedPrompt("");
      setProcessingStep("");
      
      // Ensure all pipeline stages are complete
      setPipelineStages(stages => 
        stages.map(stage => ({ ...stage, status: 'completed', progress: 100 }))
      );
      
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/thoughts`] });
      queryClient.invalidateQueries({ queryKey: ["/api/research-prompts"] });
      
      toast({
        title: "Thought Processing Complete",
        description: `Generated ${data.scenes.length} experimental scenes with enhanced pattern analysis.`,
      });
    },
    onError: (error: Error) => {
      setProcessingStep("");
      
      // Mark pipeline as errored
      setPipelineStages(stages => {
        const activeStageIndex = stages.findIndex(stage => stage.id === activeStage);
        if (activeStageIndex === -1) return stages;
        
        return stages.map((stage, index) => {
          if (index === activeStageIndex) {
            return { ...stage, status: 'error' };
          }
          return stage;
        });
      });
      
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset pipeline stages when creating a new thought
  useEffect(() => {
    if (!createThought.isPending) {
      setPipelineStages(defaultPipelineStages);
      setActiveStage(undefined);
      setShowPipeline(false);
    }
  }, [createThought.isPending]);

  // Simulate pipeline progression (in reality, this would be driven by WebSocket updates)
  useEffect(() => {
    if (!createThought.isPending || !showPipeline) return;

    let currentStageIndex = 0;
    const stageIds = pipelineStages.map(stage => stage.id);
    
    // Progress function to update stages
    const progressPipeline = () => {
      if (currentStageIndex >= stageIds.length) return;
      
      const currentStageId = stageIds[currentStageIndex];
      setActiveStage(currentStageId);
      
      // Update the current stage to processing
      setPipelineStages(stages => 
        stages.map(stage => 
          stage.id === currentStageId 
            ? { ...stage, status: 'processing', progress: 0 } 
            : stage
        )
      );
      
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Mark stage as complete
          setPipelineStages(stages => 
            stages.map(stage => 
              stage.id === currentStageId 
                ? { ...stage, status: 'completed', progress: 100 } 
                : stage
            )
          );
          
          // Move to next stage
          currentStageIndex++;
          if (currentStageIndex < stageIds.length) {
            setTimeout(progressPipeline, 500);
          }
        } else {
          // Update progress
          setPipelineStages(stages => 
            stages.map(stage => 
              stage.id === currentStageId 
                ? { ...stage, progress } 
                : stage
            )
          );
        }
      }, 300);
    };
    
    // Start the pipeline progression
    setTimeout(() => progressPipeline(), 800);
    
    // Cleanup
    return () => {
      // Any cleanup needed
    };
  }, [createThought.isPending, showPipeline]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          Advanced Thought Processor
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            Enhanced Pattern Recognition Pipeline
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          createThought.mutate();
        }}>
          <div className="space-y-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Enter your research concepts. Our enhanced AI pipeline will:
                  1. Process with parallel model analysis
                  2. Extract thought patterns and themes
                  3. Generate visual representations
                  4. Create experimental scenes
                </p>
                {suggestedPrompt && !content && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-2"
                    onClick={() => setContent(suggestedPrompt)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Use Suggested Research Topic
                  </Button>
                )}
              </div>
              <div className="md:w-1/3 relative rounded-lg overflow-hidden">
                <img 
                  src={IMAGES.backgrounds.thoughtProcessor}
                  alt="Cognitive architecture visualization" 
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                  AI-powered thought analysis
                </div>
              </div>
            </div>
            <Textarea
              placeholder="Describe your research concepts, theories, or experimental ideas..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
              aria-label="Research thought input"
            />
          </div>
          <div className="space-y-4">
            <Button
              type="submit"
              disabled={createThought.isPending || !content.trim()}
              className="w-full"
            >
              {createThought.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing with Enhanced Pipeline...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Process with Pattern Recognition
                </>
              )}
            </Button>

            {processingStep && (
              <div className="text-sm text-muted-foreground animate-pulse text-center">
                {processingStep}
              </div>
            )}
          </div>
        </form>

        {/* Pipeline Visualization */}
        {showPipeline && (
          <div className="my-6 animate-fadeIn">
            <ParallelProcessingPipeline 
              stages={pipelineStages}
              activeStage={activeStage}
              showDetails={true}
              className="border border-primary/10 shadow-lg"
            />
          </div>
        )}

        <ScrollArea className="h-[600px] mt-6">
          <div className="space-y-4">
            {thoughts.map((thought) => {
              // Cast to extended thought type for better type safety
              const extThought = thought as unknown as {
                id: number;
                content: string;
                processed: boolean | null;
                patternMetadata?: Record<string, string[]>;
                conceptualLinks?: Array<{ source: string; target: string; relationship: string }>;
                visualRepresentations?: Record<string, string[]>;
                scenePrompts?: string[];
              };
              
              return (
                <div
                  key={thought.id}
                  className="p-4 rounded-lg bg-muted/50 backdrop-blur-sm border border-primary/10"
                >
                  <p className="text-sm mb-2 font-medium">Research Thought:</p>
                  <p className="text-sm text-muted-foreground font-mono">{thought.content}</p>

                  {extThought.processed && (
                    <div className="mt-4 space-y-4">
                      {/* Thought Patterns Section */}
                      {extThought.patternMetadata && typeof extThought.patternMetadata === 'object' && (
                        <div className="p-3 rounded bg-primary/5 border border-primary/10">
                          <div className="flex items-center mb-2">
                            <Network className="h-4 w-4 mr-2 text-primary" />
                            <p className="text-sm font-medium">Thought Patterns</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(extThought.patternMetadata).map(([type, patterns]) => (
                              <div key={type} className="text-xs">
                                <p className="font-medium text-primary mb-1">{type}</p>
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                  {Array.isArray(patterns) && patterns.map((pattern: string, i: number) => (
                                    <li key={i}>{pattern}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conceptual Links Section */}
                      {extThought.conceptualLinks && Array.isArray(extThought.conceptualLinks) && extThought.conceptualLinks.length > 0 && (
                        <div className="p-3 rounded bg-secondary/5 border border-secondary/10">
                          <div className="flex items-center mb-2">
                            <Waypoints className="h-4 w-4 mr-2 text-secondary" />
                            <p className="text-sm font-medium">Conceptual Relationships</p>
                          </div>
                          <div className="space-y-2">
                            {extThought.conceptualLinks.map((link: { source: string; target: string; relationship: string }, i: number) => (
                              <div key={i} className="text-xs flex items-center gap-2">
                                <span className="text-muted-foreground">{link.source}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span className="text-muted-foreground">{link.target}</span>
                                <span className="text-xs text-primary">({link.relationship})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Visual Representations Section */}
                      {extThought.visualRepresentations && typeof extThought.visualRepresentations === 'object' && (
                        <div className="p-3 rounded bg-accent/5 border border-accent/10">
                          <div className="flex items-center mb-2">
                            <Eye className="h-4 w-4 mr-2 text-accent" />
                            <p className="text-sm font-medium">Visual Concepts</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(extThought.visualRepresentations).map(([scene, elements]) => (
                              <div key={scene} className="text-xs">
                                <p className="font-medium text-accent mb-1">{scene}</p>
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                  {Array.isArray(elements) && elements.map((element: string, i: number) => (
                                    <li key={i}>{element}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Generated Scenes Section */}
                      {extThought.scenePrompts && extThought.scenePrompts.length > 0 && (
                        <div className="p-3 rounded bg-primary/10">
                          <div className="flex items-center mb-2">
                            <Boxes className="h-4 w-4 mr-2 text-primary" />
                            <p className="text-sm font-medium">
                              Generated Scene Concepts ({extThought.scenePrompts.length})
                            </p>
                          </div>
                          <ul className="list-disc pl-4 space-y-2">
                            {extThought.scenePrompts.map((prompt, index) => (
                              <li key={index} className="text-xs text-muted-foreground">
                                {prompt}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => document.getElementById('storyboard')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                              View in Storyboard
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!extThought.processed && (
                    <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing thought patterns...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}