import React, { useState, useEffect, useRef } from 'react';
import { DeepParallelFont } from './deep-parallel-font';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Reflective surface component that responds to mouse movement
const ReflectiveSurface: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
}> = ({ children, className, intensity = 'medium' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intensity levels determine the strength of the effect
  const intensityMap = {
    subtle: {
      mainOpacity: 0.1,
      secondaryOpacity: 0.03,
      parallaxAmount: 3,
    },
    medium: {
      mainOpacity: 0.15,
      secondaryOpacity: 0.05,
      parallaxAmount: 5,
    },
    high: {
      mainOpacity: 0.2,
      secondaryOpacity: 0.08,
      parallaxAmount: 8,
    }
  };
  
  const { mainOpacity, secondaryOpacity, parallaxAmount } = intensityMap[intensity];
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate normalized position (0-1) within the element
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    }
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    // Reset to center when not hovering
    setMousePosition({ x: 0.5, y: 0.5 });
  };
  
  // Calculate gradient angle based on mouse position
  const gradientStyle = {
    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
                rgba(0, 153, 255, ${mainOpacity}) 0%, 
                rgba(0, 102, 255, ${secondaryOpacity}) 40%, 
                rgba(30, 30, 60, 0) 80%)`,
    opacity: isHovering ? 1 : 0.5,
    transform: `scale(${isHovering ? 1.05 : 1})`,
  };
  
  // Subtle parallax effect for content based on mouse position
  const contentStyle = {
    transform: isHovering ? 
      `translate(${(mousePosition.x - 0.5) * -parallaxAmount}px, ${(mousePosition.y - 0.5) * -parallaxAmount}px)` : 
      'translate(0, 0)',
    transition: 'transform 0.2s ease-out'
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={gradientStyle}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-50"></div>
      <div 
        className="relative z-10 transition-transform"
        style={contentStyle}
      >
        {children}
      </div>
    </div>
  );
};

const FontShowcase: React.FC = () => {
  const [animated, setAnimated] = useState(false);
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');
  const [color, setColor] = useState<'default' | 'gradient' | 'light' | 'dark'>('default');
  const [weight, setWeight] = useState<'light' | 'regular' | 'medium' | 'bold' | 'black'>('bold');
  const [tracking, setTracking] = useState<'normal' | 'wide' | 'wider' | 'tight'>('normal');

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Deep Parallel Brand Font</h2>
      <p className="text-xl text-muted-foreground">
        A timeless, distinctive typographic treatment for the Deep Parallel brand.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center justify-center bg-background min-h-[200px]">
          <DeepParallelFont 
            variant="standard" 
            size={size} 
            animated={animated} 
            color={color} 
            weight={weight}
            tracking={tracking}
          />
        </Card>
        <Card className="p-6 flex items-center justify-center bg-background min-h-[200px]">
          <DeepParallelFont 
            variant="stylized" 
            size={size} 
            animated={animated} 
            color={color} 
            weight={weight}
            tracking={tracking}
          />
        </Card>
        <Card className="p-6 flex items-center justify-center bg-background min-h-[200px]">
          <DeepParallelFont 
            variant="minimal" 
            size={size} 
            animated={animated} 
            color={color} 
            weight={weight}
            tracking={tracking}
          />
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <Tabs defaultValue="variant">
          <TabsList className="mb-4">
            <TabsTrigger value="variant">Variants</TabsTrigger>
            <TabsTrigger value="animation">Animation</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variant" className="space-y-4">
            <h3 className="text-lg font-medium">Font Variants</h3>
            <p className="text-muted-foreground">Choose from different variants of the Deep Parallel brand font.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-2">Standard</h4>
                <p className="text-xs text-muted-foreground mb-4">Clean, professional representation of the brand name.</p>
                <DeepParallelFont variant="standard" size="md" />
              </Card>
              
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-2">Stylized</h4>
                <p className="text-xs text-muted-foreground mb-4">With geometric accents that reinforce the brand identity.</p>
                <DeepParallelFont variant="stylized" size="md" />
              </Card>
              
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-2">Minimal</h4>
                <p className="text-xs text-muted-foreground mb-4">Clean, uppercase treatment with subtle dot separator.</p>
                <DeepParallelFont variant="minimal" size="md" />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="animation" className="space-y-4">
            <h3 className="text-lg font-medium">Animation</h3>
            <p className="text-muted-foreground">Toggle animation to see the dynamic entrance effect.</p>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch 
                id="animate" 
                checked={animated} 
                onCheckedChange={setAnimated} 
              />
              <Label htmlFor="animate">Animate font entrance</Label>
            </div>
            
            <div className="mt-6">
              <Card className="p-6 flex items-center justify-center bg-background h-[150px]">
                {animated ? (
                  <p className="text-xs text-muted-foreground">Click the switch again to reset animation</p>
                ) : (
                  <DeepParallelFont variant="stylized" animated={animated} size="lg" />
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="typography" className="space-y-4">
            <h3 className="text-lg font-medium">Typography Settings</h3>
            <p className="text-muted-foreground">Adjust typography settings to see different variations.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select
                    value={size}
                    onValueChange={(value) => setSize(value as any)}
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                      <SelectItem value="2xl">2XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Select
                    value={weight}
                    onValueChange={(value) => setWeight(value as any)}
                  >
                    <SelectTrigger id="weight">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Select
                    value={color}
                    onValueChange={(value) => setColor(value as any)}
                  >
                    <SelectTrigger id="color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tracking">Letter Spacing</Label>
                  <Select
                    value={tracking}
                    onValueChange={(value) => setTracking(value as any)}
                  >
                    <SelectTrigger id="tracking">
                      <SelectValue placeholder="Select tracking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="wider">Wider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Card className="p-6 flex items-center justify-center bg-background min-h-[150px]">
                <DeepParallelFont 
                  variant="standard" 
                  size={size} 
                  color={color} 
                  weight={weight}
                  tracking={tracking}
                />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Interactive showcase with reflective surface */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Interactive Showcase</h3>
        <p className="text-muted-foreground">
          Move your cursor over the following showcase to see the reflective effects at different intensity levels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden">
            <ReflectiveSurface 
              className="p-8 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black min-h-[200px]"
              intensity="subtle"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <DeepParallelFont variant="standard" size="xl" color="gradient" />
                <div className="h-4" />
                <span className="text-xs text-gray-400 mt-2">Subtle Intensity</span>
              </motion.div>
            </ReflectiveSurface>
          </Card>

          <Card className="overflow-hidden">
            <ReflectiveSurface 
              className="p-8 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black min-h-[200px]"
              intensity="medium"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <DeepParallelFont variant="stylized" size="xl" color="gradient" />
                <div className="h-4" />
                <span className="text-xs text-gray-400 mt-2">Medium Intensity</span>
              </motion.div>
            </ReflectiveSurface>
          </Card>

          <Card className="overflow-hidden">
            <ReflectiveSurface 
              className="p-8 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black min-h-[200px]"
              intensity="high"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <DeepParallelFont variant="minimal" size="xl" color="light" />
                <div className="h-4" />
                <span className="text-xs text-gray-400 mt-2">High Intensity</span>
              </motion.div>
            </ReflectiveSurface>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <ReflectiveSurface 
            className="p-12 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black min-h-[250px]"
            intensity="high"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <DeepParallelFont variant="stylized" size="2xl" color="gradient" />
              <div className="h-8" />
              <DeepParallelFont variant="minimal" size="md" color="light" />
              <p className="mt-6 text-sm text-gray-400 max-w-md text-center">
                Interactive surfaces enhance the brand presence by creating a dynamic, responsive visual experience that reinforces the "parallel" concept through light reflection.
              </p>
            </motion.div>
          </ReflectiveSurface>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium">Usage Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <ReflectiveSurface className="bg-primary/10 p-8 flex items-center justify-center">
              <DeepParallelFont variant="stylized" size="xl" color="gradient" />
            </ReflectiveSurface>
            <div className="p-4">
              <h4 className="font-medium">Website Header</h4>
              <p className="text-sm text-muted-foreground">Primary brand presentation for web applications</p>
            </div>
          </Card>
          
          <Card className="overflow-hidden">
            <ReflectiveSurface className="bg-black p-8 flex items-center justify-center">
              <DeepParallelFont variant="minimal" size="lg" color="light" />
            </ReflectiveSurface>
            <div className="p-4">
              <h4 className="font-medium">Dark Mode Application</h4>
              <p className="text-sm text-muted-foreground">Minimal variant for dark backgrounds</p>
            </div>
          </Card>
        </div>
      </div>
      
      <Card className="p-6">
        <h3 className="text-xl font-medium mb-4">Font Guidelines</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium">Clear Space</h4>
            <p className="text-muted-foreground">Maintain minimum clear space around the logo equal to the cap height of the font.</p>
          </div>
          
          <div>
            <h4 className="font-medium">Minimum Size</h4>
            <p className="text-muted-foreground">For digital use, don't display the logo smaller than 24px in height. For print, 0.25 inches.</p>
          </div>
          
          <div>
            <h4 className="font-medium">Color Usage</h4>
            <p className="text-muted-foreground">The gradient version should be used sparingly for high-impact moments. Default to solid colors for general usage.</p>
          </div>
          
          <div>
            <h4 className="font-medium">Modifications</h4>
            <p className="text-muted-foreground">Do not distort, rotate, or alter the proportions of the brand font treatment.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FontShowcase;