
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function Image({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.png",
  ...props
}: ImageProps) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt || "Image"}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
      {...props}
    />
  );
}
