import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Project from "@/pages/project";
import AnimationDemo from "@/components/animation-demo";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import LandingPage from "@/pages/landing";
import ApiKeyManagement from "@/pages/api-key-management";
import PipelineManagement from "@/pages/pipeline-management";
import PipelineConfig from "@/pages/pipeline-config";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Home} />
      <Route path="/project/:id" component={Project} />
      <Route path="/animations" component={AnimationDemo} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/api-keys" component={ApiKeyManagement} />
      <Route path="/pipelines" component={PipelineManagement} />
      <Route path="/pipelines/new" component={PipelineConfig} />
      <Route path="/pipelines/:id/edit" component={PipelineConfig} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={darkMode ? 'dark' : ''}>
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
