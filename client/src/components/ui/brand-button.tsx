
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-glow active:translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:shadow-glow active:translate-y-0.5",
        accent:
          "bg-accent text-accent-foreground hover:shadow-glow active:translate-y-0.5",
        outline:
          "border border-input bg-background hover:bg-accent/10 hover:text-accent-foreground active:translate-y-0.5",
        ghost:
          "hover:bg-accent/10 hover:text-accent-foreground active:translate-y-0.5",
        neural: "gradient-border neural-pulse-light active:translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const BrandButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
BrandButton.displayName = "BrandButton";

export { BrandButton, buttonVariants };
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'neural' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export function BrandButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-primary bg-transparent text-primary hover:bg-primary/10',
    neural: 'btn-neural bg-background border border-primary/30 text-primary hover:border-primary/60',
    minimal: 'bg-transparent text-foreground hover:bg-muted/20',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
    </button>
  );
}
