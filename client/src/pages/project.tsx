import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProjectSidebar from "@/components/project-sidebar";
import Storyboard from "@/components/storyboard";
import ThoughtProcessor from "@/components/thought-processor";
import ScenePreview from "@/components/scene-preview";
import { Separator } from "@/components/ui/separator";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";

export default function Project() {
  const { id } = useParams();
  const projectId = parseInt(id);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: scenes } = useQuery({
    queryKey: [`/api/projects/${projectId}/scenes`],
  });

  const { data: thoughts } = useQuery({
    queryKey: [`/api/projects/${projectId}/thoughts`],
  });

  if (projectLoading) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar project={project} />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel 
          defaultSize={50} 
          minSize={30}
          className="overflow-auto p-4"
        >
          <div className="space-y-4">
            <section aria-label="Thought Processing">
              <ThoughtProcessor 
                projectId={projectId}
                thoughts={thoughts || []}
              />
            </section>

            <Separator className="my-6" />

            <section aria-label="Storyboard">
              <Storyboard 
                projectId={projectId}
                scenes={scenes || []}
              />
            </section>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <section aria-label="Scene Preview" className="h-full p-4">
            <ScenePreview scenes={scenes || []} />
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}