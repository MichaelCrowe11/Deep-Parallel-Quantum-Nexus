import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Video, Settings, FilmIcon, ImageIcon, ChevronLeft, ChevronRight, Film, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransitionEffect } from "@/components/ui/transition-effect";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Scene } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScenePreviewProps {
  scenes: Scene[];
}

type TransitionType = "fade" | "slide" | "zoom" | "dissolve";
type ViewMode = "single" | "sequence";

export default function ScenePreview({ scenes }: ScenePreviewProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [transitionType, setTransitionType] = useState<TransitionType>("fade");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(3000); // 3 seconds
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const currentScene = scenes[currentSceneIndex] || null;

  // Handle autoplay for sequence mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && viewMode === "sequence" && scenes.length > 1) {
      timer = setTimeout(() => {
        setCurrentSceneIndex((prevIndex) => (prevIndex + 1) % scenes.length);
      }, autoplaySpeed);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentSceneIndex, scenes.length, viewMode, autoplaySpeed]);

  const generateVisualization = useMutation({
    mutationFn: async (sceneId: number) => {
      const res = await apiRequest("POST", `/api/scenes/${sceneId}/visualize`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentScene?.projectId}/scenes`] });
      toast({
        title: "Visualization Generated",
        description: "The scene visualization has been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateVideo = useMutation({
    mutationFn: async (sceneId: number) => {
      const res = await apiRequest("POST", `/api/scenes/${sceneId}/generate-video`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentScene?.projectId}/scenes`] });
      toast({
        title: "Video Generated",
        description: `The scene video has been generated successfully using ${data.provider}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const navigateScene = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentSceneIndex((prevIndex) => 
        prevIndex > 0 ? prevIndex - 1 : scenes.length - 1
      );
    } else {
      setCurrentSceneIndex((prevIndex) => 
        prevIndex < scenes.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  return (
    <Card id="preview" className="h-full scroll-mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Play className="mr-2 h-5 w-5" />
            Scene Preview
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              {scenes.length > 0 
                ? `Scene ${currentSceneIndex + 1} of ${scenes.length}` 
                : 'No scenes yet'
              }
            </span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Tabs 
              value={viewMode} 
              onValueChange={(value) => {
                setViewMode(value as ViewMode);
                setIsPlaying(false);
              }}
              className="mr-2"
            >
              <TabsList>
                <TabsTrigger value="single">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Single
                </TabsTrigger>
                <TabsTrigger value="sequence">
                  <Film className="mr-2 h-4 w-4" />
                  Sequence
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select
              value={transitionType}
              onValueChange={(value) => setTransitionType(value as TransitionType)}
            >
              <SelectTrigger className="w-[140px]">
                <Settings className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Transition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="dissolve">Dissolve</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scenes.length > 0 && currentScene ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateScene('prev')}
                disabled={scenes.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {viewMode === "sequence" && (
                <Button
                  variant={isPlaying ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={scenes.length <= 1}
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Stop Autoplay
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Autoplay Sequence
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateScene('next')}
                disabled={scenes.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <TransitionEffect 
              scene={currentScene} 
              transitionType={transitionType}
              duration={0.7}
            >
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {currentScene.videoUrl ? (
                  <video
                    src={currentScene.videoUrl}
                    controls
                    className="w-full h-full rounded-lg"
                    autoPlay={isPlaying}
                    loop={isPlaying}
                    muted={isPlaying}
                  />
                ) : (
                  <div className="text-center p-4">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-4">
                      No visualization yet
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => currentScene && generateVisualization.mutate(currentScene.id)}
                        disabled={generateVisualization.isPending}
                      >
                        {generateVisualization.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="mr-2 h-4 w-4" />
                        )}
                        Generate Image
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => currentScene && generateVideo.mutate(currentScene.id)}
                        disabled={generateVideo.isPending}
                      >
                        {generateVideo.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FilmIcon className="mr-2 h-4 w-4" />
                        )}
                        Generate Video
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium">Original Description:</p>
                <p className="text-sm text-muted-foreground">{currentScene.description}</p>
                {currentScene.enhancedDescription && (
                  <>
                    <p className="text-sm font-medium mt-4">Enhanced Description:</p>
                    <p className="text-sm text-primary">{currentScene.enhancedDescription}</p>
                  </>
                )}
              </div>
            </TransitionEffect>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No scenes to preview</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start by adding thoughts or creating scenes
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}