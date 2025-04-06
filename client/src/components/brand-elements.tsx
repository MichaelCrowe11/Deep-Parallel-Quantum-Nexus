import React from 'react';
import { cn } from '@/lib/utils';
import '../styles/brand.css';
import { motion } from 'framer-motion';
import { buttonHover } from '../lib/animations';

export interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'neural' | 'insight' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, onClick, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'bg-[hsl(200,100%,60%)] hover:bg-[hsl(200,100%,55%)]';
        case 'neural':
          return 'bg-[hsl(220,100%,50%)] hover:bg-[hsl(220,100%,45%)]';
        case 'insight':
          return 'bg-[hsl(180,100%,65%)] hover:bg-[hsl(180,100%,60%)]';
        case 'gradient':
          return 'bg-gradient-to-r from-[#2b87ff] via-[#6d56f9] to-[#00d8ff] hover:opacity-90 text-white';
        case 'outline':
          return 'bg-transparent border border-[#2b87ff]/30 text-white hover:bg-[#2b87ff]/10';
        default:
          return 'bg-[hsl(200,100%,60%)] hover:bg-[hsl(200,100%,55%)]';
      }
    };

    return (
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded transition-colors',
          getVariantStyles(),
          size === 'sm' && 'text-sm py-1 px-3',
          size === 'md' && 'text-base py-2 px-4',
          size === 'lg' && 'text-lg py-3 px-6',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
BrandButton.displayName = 'BrandButton';

export interface BrandCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const BrandCard = React.forwardRef<HTMLDivElement, BrandCardProps>(
  ({ className = '', title, children, ...props }, ref) => {
    return (
      <div className={cn('bg-[hsl(220,15%,12%)] rounded-lg border border-[hsl(220,20%,20%)]', className)} ref={ref} {...props}>
        {title && (
          <div className="brand-card-header">
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
        )}
        <div>{children}</div>
      </div>
    );
  }
);
BrandCard.displayName = 'BrandCard';

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const GradientText = React.forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span className={cn('brand-gradient', className)} ref={ref} {...props}>
        {children}
      </span>
    );
  }
);
GradientText.displayName = 'GradientText';

export const HexagonBackground: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('hexagon-pattern', className)} {...props}>
      {children}
    </div>
  );
};

export interface IconProps extends React.SVGAttributes<SVGElement> {
  variant?: 'default' | 'primary' | 'neural' | 'insight';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className = '', variant = 'default', icon, size = 'md', ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'text-[hsl(200,100%,60%)]';
        case 'neural':
          return 'text-[hsl(220,100%,50%)]';
        case 'insight':
          return 'text-[hsl(180,100%,65%)]';
        default:
          return 'text-foreground';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'p-1';
        case 'md':
          return 'p-2';
        case 'lg':
          return 'p-3';
        default:
          return 'p-2';
      }
    };

    if (icon) {
      return React.cloneElement(icon as React.ReactElement, {
        className: cn(
          'brand-icon',
          variant === 'primary' && 'brand-icon-primary',
          variant === 'neural' && 'brand-icon-neural',
          variant === 'insight' && 'brand-icon-insight',
          className
        ),
        ref,
        ...props,
      });
    }

    return (
      <div className={cn(
        `rounded-full bg-[hsl(220,15%,14%)]`,
        getSizeStyles(),
        getVariantStyles(),
        className
      )}>
        {props.children}
      </div>
    );
  }
);
BrandIcon.displayName = 'BrandIcon';

interface BrandGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export const BrandGradientText: React.FC<BrandGradientTextProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <span className={`bg-gradient-to-r from-[hsl(200,100%,60%)] to-[hsl(180,100%,65%)] bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

export const BrandDivider: React.FC<{className?: string}> = ({ className = '' }) => {
  return (
    <div className={`h-px bg-gradient-to-r from-transparent via-[hsl(220,20%,30%)] to-transparent ${className}`}></div>
  );
};

interface BrandBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'neural' | 'insight';
  className?: string;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({ 
  children, 
  variant = 'primary',
  className = '' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[hsla(200,100%,60%,0.1)] text-[hsl(200,100%,60%)]';
      case 'neural':
        return 'bg-[hsla(220,100%,50%,0.1)] text-[hsl(220,100%,50%)]';
      case 'insight':
        return 'bg-[hsla(180,100%,65%,0.1)] text-[hsl(180,100%,65%)]';
      default:
        return 'bg-[hsla(200,100%,60%,0.1)] text-[hsl(200,100%,60%)]';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantStyles()} ${className}`}>
      {children}
    </span>
  );
};
