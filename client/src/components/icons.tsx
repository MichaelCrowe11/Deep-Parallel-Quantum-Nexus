
import { forwardRef } from "react";

// Custom FlowParallel icon implementation since it's missing from lucide-react
export const FlowParallel = forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ ...props }, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="6" height="6" rx="2" />
    <rect x="2" y="16" width="6" height="6" rx="2" />
    <rect x="16" y="2" width="6" height="6" rx="2" />
    <rect x="16" y="16" width="6" height="6" rx="2" />
    <path d="M8 5h8" />
    <path d="M8 19h8" />
    <path d="M19 5v14" />
    <path d="M5 5v14" />
  </svg>
));
FlowParallel.displayName = "FlowParallel";
