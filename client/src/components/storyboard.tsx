import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, Plus, Loader2, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Scene } from "@shared/schema";

interface StoryboardProps {
  projectId: number;
  scenes: Scene[];
}

export default function Storyboard({ projectId, scenes }: StoryboardProps) {
  const queryClient = useQueryClient();

  const createScene = useMutation({
    mutationFn: async (description: string) => {
      const res = await apiRequest("POST", "/api/scenes", {
        projectId,
        order: scenes.length + 1,
        description,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/scenes`] });
    },
  });

  return (
    <Card id="storyboard" className="scroll-mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Film className="mr-2 h-5 w-5" />
          Storyboard
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            ({scenes.length} scenes)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <Card key={scene.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Scene {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                  <p className="text-sm">{scene.description}</p>
                  {scene.enhancedDescription && (
                    <div className="mt-2 p-2 rounded bg-primary/5">
                      <p className="text-sm text-primary">{scene.enhancedDescription}</p>
                    </div>
                  )}
                  {scene.videoUrl && (
                    <video 
                      src={scene.videoUrl}
                      className="mt-2 rounded-lg w-full"
                      controls
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const description = new FormData(form).get("description") as string;
                createScene.mutate(description);
                form.reset();
              }}
            >
              <Textarea
                name="description"
                placeholder="Add a new scene..."
                className="mb-2"
              />
              <Button 
                type="submit"
                disabled={createScene.isPending}
                className="w-full"
              >
                {createScene.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Scene
                  </>
                )}
              </Button>
            </form>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}