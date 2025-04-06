import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Video, 
  Settings, 
  Brain,
  Lightbulb,
  Film,
  ArrowLeft,
  Network // Added Network icon as a fallback
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Project } from "@shared/schema";

interface ProjectSidebarProps {
  project: Project;
}

export default function ProjectSidebar({ project }: ProjectSidebarProps) {
  return (
    <nav 
      className="w-64 border-r bg-card p-4"
      aria-label="Project navigation"
    >
      <div className="flex items-center mb-6">
        <Video className="h-6 w-6 mr-2" />
        <h1 className="font-bold truncate">{project.title}</h1>
      </div>

      <Separator className="mb-4" />

      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Return to projects list</TooltipContent>
        </Tooltip>

        <Separator className="my-4" />

        <h2 className="text-sm font-semibold mb-2 px-2">Research Tools</h2>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => document.querySelector('[aria-label="Thought Processing"]')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Brain className="mr-2 h-4 w-4" />
              Thought Processor
            </Button>
          </TooltipTrigger>
          <TooltipContent>Process and analyze research thoughts</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => document.querySelector('[aria-label="Storyboard"]')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Film className="mr-2 h-4 w-4" />
              Storyboard
            </Button>
          </TooltipTrigger>
          <TooltipContent>Visual experiment storyboard</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => document.querySelector('[aria-label="Scene Preview"]')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Video className="mr-2 h-4 w-4" />
              Scene Preview
            </Button>
          </TooltipTrigger>
          <TooltipContent>Preview generated scenes</TooltipContent>
        </Tooltip>
      </div>

      <Separator className="my-4" />

      <div className="text-sm text-muted-foreground">
        <h2 className="font-medium mb-2">Project Details</h2>
        <p className="mb-2">{project.description}</p>
        <p className="text-xs">Status: {project.status}</p>
      </div>
    </nav>
  );
}