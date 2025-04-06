import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Brain, 
  Film, 
  LucideIcon, 
  Layers, 
  Settings, 
  GitBranch,
  Play,
  Wand2,
  Sparkles,
  Key
} from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
}

const NavItem = ({ icon: Icon, label, href, isActive }: NavItemProps) => (
  <Link href={href}>
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      "hover:bg-primary/10 hover:translate-x-1",
      "group relative overflow-hidden cursor-pointer",
      isActive && "bg-primary/15 text-primary"
    )}>
      <div className="relative z-10">
        <Icon className={cn(
          "w-5 h-5 transition-all",
          isActive ? "text-primary" : "text-muted-foreground",
          "group-hover:text-primary group-hover:scale-110"
        )} />
      </div>
      <span className={cn(
        "text-sm font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground",
        "group-hover:text-primary"
      )}>
        {label}
      </span>
      {isActive && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      )}
    </div>
  </Link>
);

export const SideNav = () => {
  const [location] = useLocation();

  const navItems = [
    { icon: Brain, label: "Dashboard", href: "/dashboard" },
    { icon: Film, label: "Projects", href: "/dashboard" }, // Will filter for project-type
    { icon: Layers, label: "Storyboards", href: "/dashboard" }, // Will filter for storyboard-type
    { icon: Sparkles, label: "Animations", href: "/animations" },
    { icon: GitBranch, label: "Pipelines", href: "/pipelines" },
    { icon: Key, label: "API Keys", href: "/api-keys" },
    { icon: Settings, label: "Admin", href: "/admin" },
  ];

  return (
    <nav className="w-64 bg-background/50 backdrop-blur-xl border-r border-primary/10 p-4 flex flex-col gap-2">
      <div className="mb-8">
        <h2 className="text-lg font-semibold heading-gradient mb-1">DeepParallel</h2>
        <p className="text-sm text-muted-foreground">Research to Cinema</p>
      </div>

      {navItems.map((item) => (
        <NavItem 
          key={item.href}
          {...item}
          isActive={location === item.href || location.startsWith(`${item.href}/`)}
        />
      ))}

      <div className="mt-auto pt-4 border-t border-primary/10">
        <div className="px-4 py-2">
          <p className="text-xs text-muted-foreground">Powered by</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium">Claude 3.7</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs font-medium">Together.ai</span>
          </div>
        </div>
      </div>
    </nav>
  );
};