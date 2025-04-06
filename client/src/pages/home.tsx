import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Beaker, Film, Sparkles, Code, Layers, GitBranch, Key } from "lucide-react";
import type { Project } from "@shared/schema";
import { DeepParallelFont } from "@/components/deep-parallel-font";
import FontShowcase from "@/components/font-showcase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [animated, setAnimated] = useState(true);

  // Trigger the animation to reset when needed
  const resetAnimation = () => {
    setAnimated(false);
    setTimeout(() => setAnimated(true), 50);
  };

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/projects", { title, description });
      return res.json();
    },
    onSuccess: (data) => {
      setLocation(`/project/${data.id}`);
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="py-12 bg-gradient-to-b from-background to-background/90">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col items-center justify-center space-y-8">
            <div onClick={resetAnimation} className="cursor-pointer" title="Click to replay animation">
              <DeepParallelFont variant="stylized" size="2xl" color="gradient" animated={animated} />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl text-center">
              Transforming complex concepts into coherent, visually stunning narratives
              through our innovative multi-stage processing pipeline.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => setLocation('/dashboard')}
              >
                <Layers className="h-5 w-5" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => setLocation('/pipelines')}
              >
                <GitBranch className="h-5 w-5" />
                Pipelines
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => setLocation('/api-keys')}
              >
                <Key className="h-5 w-5" />
                API Keys
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <Tabs defaultValue="showcase" className="w-full">
          <TabsList className="mb-8 flex justify-center">
            <TabsTrigger value="showcase">
              <Code className="mr-2 h-4 w-4" />
              Brand Font
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Layers className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="showcase">
            <FontShowcase />
          </TabsContent>
          
          <TabsContent value="projects">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Beaker className="mr-2 h-5 w-5" />
                    Create New Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    createProject.mutate();
                  }}>
                    <Input
                      placeholder="Project Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mb-4"
                      aria-label="Project title"
                    />
                    <Textarea
                      placeholder="Describe your project goals and approach..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mb-4 min-h-[100px]"
                      aria-label="Project description"
                    />
                    <Button 
                      type="submit"
                      disabled={createProject.isPending}
                      className="w-full"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start New Project
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Film className="mr-2 h-5 w-5" />
                    Your Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center text-muted-foreground">
                      Loading projects...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                          No projects yet. Create your first one to get started!
                        </p>
                      ) : (
                        projects.map((project) => (
                          <Button
                            key={project.id}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setLocation(`/project/${project.id}`)}
                          >
                            <Film className="mr-2 h-4 w-4" />
                            <div className="text-left">
                              <div>{project.title}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-xs">
                                {project.description}
                              </div>
                            </div>
                          </Button>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
