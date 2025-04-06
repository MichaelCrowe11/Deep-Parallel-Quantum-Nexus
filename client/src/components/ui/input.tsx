
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  variant?: "default" | "neural" | "minimal";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, variant = "default", ...props }, ref) => {
    const inputClasses = cn(
      "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
      {
        "border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2": 
          variant === "default",
        "gradient-border bg-background/60 backdrop-blur-sm focus:shadow-glow-primary": 
          variant === "neural",
        "border-none bg-muted/50 focus-visible:bg-muted/80": 
          variant === "minimal"
      },
      icon ? "pl-10" : "",
      className
    );

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input type={type} className={inputClasses} ref={ref} {...props} />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
