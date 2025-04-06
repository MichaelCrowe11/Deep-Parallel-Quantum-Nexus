import { SideNav } from "@/components/ui/side-nav";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className="min-h-screen flex">
      <SideNav />
      
      {/* Weaver Background */}
      <div className="weaver-background">
        <div className="weaver-glow" />
        <div className="neural-pattern" />
      </div>
      
      <main className={cn(
        "flex-1 p-6 relative",
        "bg-background/50 backdrop-blur-xl",
        className
      )}>
        {children}
      </main>
    </div>
  );
};
