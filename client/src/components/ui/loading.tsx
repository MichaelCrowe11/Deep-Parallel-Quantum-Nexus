
import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "dots" | "neural";
  label?: string;
}

const Loading = ({
  size = "md",
  variant = "spinner",
  label,
  className,
  ...props
}: LoadingProps) => {
  // Size mappings
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  // Container size for certain variants
  const containerSizeClasses = {
    sm: "h-4",
    md: "h-8",
    lg: "h-12"
  };

  // Render different loading indicators based on variant
  const renderLoadingIndicator = () => {
    switch (variant) {
      case "neural":
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-2 border-border opacity-30"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn("rounded-full bg-primary animate-pulse", {
                "w-1 h-1": size === "sm",
                "w-2 h-2": size === "md",
                "w-3 h-3": size === "lg"
              })}></div>
            </div>
          </div>
        );

      case "pulse":
        return (
          <div className={cn("flex space-x-1", containerSizeClasses[size])}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-primary animate-pulse", 
                  {
                    "w-1 h-1": size === "sm",
                    "w-2 h-2": size === "md",
                    "w-3 h-3": size === "lg"
                  }
                )}
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        );

      case "dots":
        return (
          <div className={cn("flex space-x-1", containerSizeClasses[size])}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-primary animate-bounce", 
                  {
                    "w-1 h-1": size === "sm",
                    "w-2 h-2": size === "md",
                    "w-3 h-3": size === "lg"
                  }
                )}
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        );

      case "spinner":
      default:
        return (
          <div className={cn("border-t-primary animate-spin rounded-full border-2 border-border/30", sizeClasses[size])}></div>
        );
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-3", className)} {...props}>
      {renderLoadingIndicator()}
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
};

export { Loading };
