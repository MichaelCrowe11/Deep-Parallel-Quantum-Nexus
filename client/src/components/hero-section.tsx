import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { IMAGES } from "@/config/assets";
import { fadeIn, fadeInUp } from "@/lib/animations";
import { Link } from "wouter";
import { BrandButton } from "./brand-elements";
import { DeepVisualization } from "./deep-visualizations";
import { CircularEnergyLoader } from "./circular-energy-loader";
import { cn } from "@/lib/utils";

// Neural network visualization component
const NeuralNetworkVisualization = ({ className = "" }) => {
  // Create refs for canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameId = useRef<number>(0);

  // Initialize the neural network visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const updateDimensions = () => {
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Initialize nodes and connections
    const initializeNetwork = () => {
      const nodeCount = 100;
      const tempNodes = [];
      
      // Create nodes
      for (let i = 0; i < nodeCount; i++) {
        tempNodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 1 + Math.random() * 2,
          vx: Math.random() * 0.3 - 0.15,
          vy: Math.random() * 0.3 - 0.15,
          color: `rgba(${43 + Math.random() * 50}, ${135 + Math.random() * 50}, ${255 - Math.random() * 50}, ${0.3 + Math.random() * 0.5})`
        });
      }
      
      setNodes(tempNodes);
      
      // Create connections (edges between nodes)
      const tempConnections = [];
      for (let i = 0; i < nodeCount; i++) {
        const connectionCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < connectionCount; j++) {
          const target = Math.floor(Math.random() * nodeCount);
          if (i !== target) {
            tempConnections.push({
              from: i,
              to: target,
              strength: Math.random() * 0.8 + 0.1, // Connection opacity/strength
              pulseSpeed: 0.5 + Math.random() * 2,
              pulseProgress: Math.random() * 100, // Random start position
              color: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 155}, 0.15)`
            });
          }
        }
      }
      
      setConnections(tempConnections);
    };
    
    initializeNetwork();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  // Optimize the neural network animation
  useEffect(() => {
    if (!canvasRef.current || !nodes.length || !connections.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Store local copies of state to avoid rerenders
    let localNodes = [...nodes];
    let localConnections = [...connections];
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections first (background layer)
      localConnections.forEach(conn => {
        const fromNode = localNodes[conn.from];
        const toNode = localNodes[conn.to];
        
        // Draw connection
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = conn.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Update pulse position for next frame
        conn.pulseProgress = (conn.pulseProgress + conn.pulseSpeed) % 100;
        const pulseFraction = conn.pulseProgress / 100;
        const pulseX = fromNode.x + (toNode.x - fromNode.x) * pulseFraction;
        const pulseY = fromNode.y + (toNode.y - fromNode.y) * pulseFraction;
        
        // Draw pulse with optimized gradient
        const gradient = ctx.createRadialGradient(
          pulseX, pulseY, 0,
          pulseX, pulseY, 8
        );
        gradient.addColorStop(0, 'rgba(109, 86, 249, 0.7)');
        gradient.addColorStop(1, 'rgba(109, 86, 249, 0)');
        
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Update and draw nodes (foreground layer)
      localNodes.forEach(node => {
        // Move node slightly
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Draw glow effect (optimized)
        const glow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 4
        );
        glow.addColorStop(0, 'rgba(43, 135, 255, 0.4)');
        glow.addColorStop(1, 'rgba(43, 135, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });
      
      // Update state less frequently to improve performance (every 10 frames)
      if (Math.random() < 0.1) {
        setNodes([...localNodes]);
        setConnections([...localConnections]);
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [dimensions]); // Only depend on dimensions to prevent unnecessary rerenders
  
  return (
    <canvas 
      ref={canvasRef} 
      className={cn("absolute inset-0 w-full h-full", className)}
    />
  );
};

// Advanced 3D thought sphere component
const ThoughtSphere = ({ className = "" }) => {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Multiple orbiting rings */}
        {[...Array(3)].map((_, i) => {
          const size = 70 - i * 10;
          const duration = 20 + i * 5;
          const delay = i * 2;
          
          return (
            <motion.div
              key={i}
              className="absolute border-[1px] border-primary/20 rounded-full"
              style={{ 
                width: `${size}%`, 
                height: `${size}%`,
                boxShadow: "0 0 15px rgba(43, 135, 255, 0.1)"
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 0.6,
                rotateX: [0, 90, 180, 270, 360],
                rotateY: [0, 180, 360],
              }}
              transition={{ 
                opacity: { delay: 0.5 + delay, duration: 2 },
                rotateX: { duration, repeat: Infinity, ease: "linear" },
                rotateY: { duration: duration * 1.4, repeat: Infinity, ease: "linear" },
              }}
            />
          );
        })}
        
        {/* Core sphere - using our circular energy loader */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.5 }}
          style={{ width: '50%', height: '50%' }}
        >
          <CircularEnergyLoader size="xl" type="thought" />
        </motion.div>
        
        {/* Orbiting thought particles */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const radius = 30 + (i % 3) * 5;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;
          const size = 3 + Math.random() * 2;
          const orbitDuration = 10 + Math.random() * 10;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/80"
              style={{ 
                width: `${size}px`, 
                height: `${size}px`,
                boxShadow: "0 0 10px rgba(43, 135, 255, 0.8)",
                left: `calc(50% + ${offsetX}%)`,
                top: `calc(50% + ${offsetY}%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0.5, 0.8, 0],
                scale: [0, 1, 0.8, 1, 0],
              }}
              transition={{ 
                duration: orbitDuration,
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          );
        })}
        
        {/* Connection lines between particles */}
        <div className="absolute inset-0">
          <NeuralNetworkVisualization />
        </div>
        
        {/* Central energy burst */}
        <motion.div 
          className="absolute"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0.2, 1.5, 0.2],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-r from-primary/40 via-secondary/30 to-accent/20 blur-md" />
        </motion.div>
      </div>
    </div>
  );
};

// Pipeline stages data
const pipelineStages = [
  {
    id: "intake",
    name: "Thought Intake & Analysis",
    icon: "parallel-processing",
    description: "Advanced semantic understanding of conceptual structures through multi-model correlation analysis"
  },
  {
    id: "synthesis",
    name: "Deep Pattern Synthesis",
    icon: "deep-synthesis",
    description: "Identifying emergent metapatterns and cross-domain insights through parallel processing"
  },
  {
    id: "enhancement",
    name: "Concept Amplification",
    icon: "concept-enhancement", 
    description: "Expanding idea dimensionality through recursive enhancement of conceptual connections"
  },
  {
    id: "visualization",
    name: "Visual Translation Layer",
    icon: "multi-stage",
    description: "Converting abstract patterns into coherent visual narratives with cinematic qualities"
  },
  {
    id: "output",
    name: "Multi-modal Generation",
    icon: "performance-metrics",
    description: "Creating synchronized outputs across image, video, text, and interactive media formats"
  }
];

// Main Hero Section component
export function HeroSection() {
  const [activeStage, setActiveStage] = useState(0);
  const controls = useAnimation();
  const portalImage = IMAGES.hero.main;
  
  // Handle automatic progression through pipeline stages
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % pipelineStages.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Animate when active stage changes
  useEffect(() => {
    controls.start({
      opacity: [0.3, 1],
      y: [20, 0],
      transition: { duration: 0.5 }
    });
  }, [activeStage, controls]);

  return (
    <div className="relative w-full overflow-hidden bg-black min-h-[100vh] flex items-center">
      {/* Dynamic background - abstract neural patterns */}
      <div className="absolute inset-0 z-0 opacity-30">
        <NeuralNetworkVisualization />
      </div>
      
      {/* Advanced thought sphere */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <ThoughtSphere />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text content and interactive pipeline */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ duration: 1, delay: 0.7 }}
              className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/20"
            >
              <span className="text-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-sm font-medium">
                Multi-Stage Thought Pipeline
              </span>
            </motion.div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="block text-white mb-2">Visualize</span>
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Parallel Thinking
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl">
              Experience revolutionary multi-model AI processing that transforms abstract thought patterns into immersive visual experiences with unprecedented fidelity and insight.
            </p>
            
            {/* Interactive pipeline stages visualization */}
            <div className="mb-8 bg-black/30 backdrop-blur-md rounded-xl border border-primary/10 p-5">
              <h3 className="text-xl font-bold text-white mb-4">Advanced Processing Pipeline</h3>
              
              <div className="flex overflow-x-auto pb-2 mb-4 gap-1">
                {pipelineStages.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className={cn(
                      "flex-shrink-0 py-2 px-3 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-2",
                      activeStage === index 
                        ? "bg-primary/20 border border-primary/40" 
                        : "hover:bg-white/5"
                    )}
                    onClick={() => setActiveStage(index)}
                  >
                    <DeepVisualization 
                      type={stage.icon as any} 
                      size="sm" 
                      animated={activeStage === index}
                    />
                    <span className={cn(
                      "text-sm whitespace-nowrap",
                      activeStage === index ? "text-white" : "text-white/70"
                    )}>
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <motion.div 
                animate={controls}
                className="bg-black/50 rounded-lg p-4 border border-primary/10 min-h-[100px]"
              >
                <h4 className="text-md font-semibold text-primary mb-2">
                  {pipelineStages[activeStage].name}
                </h4>
                <p className="text-sm text-gray-300">
                  {pipelineStages[activeStage].description}
                </p>
              </motion.div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/project/1">
                <div>
                  <BrandButton 
                    variant="gradient" 
                    size="lg" 
                    className="shadow-lg shadow-primary/20 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Experience the Processor</span>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                    />
                  </BrandButton>
                </div>
              </Link>
              
              <Link href="#showcase">
                <div>
                  <BrandButton 
                    variant="outline" 
                    size="lg" 
                    className="border-primary/30 text-white bg-black/30 backdrop-blur-sm"
                  >
                    View Showcase
                  </BrandButton>
                </div>
              </Link>
            </div>
          </motion.div>
          
          {/* Right side - 3D visualization of thought processing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-primary/10"
          >
            {/* Advanced 3D visualization */}
            <div className="absolute inset-0 bg-black/70 z-0" />
            
            {/* Foreground visualization - layered depth effect */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                  rotateZ: [0, 10, 0, -10, 0],
                }}
                transition={{ 
                  rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                  rotateZ: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                }}
                className="relative w-4/5 h-4/5 perspective-[1000px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Multiple layered images for 3D effect */}
                {IMAGES.categories.thought.slice(0, 5).map((image, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-xl overflow-hidden"
                    style={{ 
                      transformStyle: "preserve-3d",
                      transform: `translateZ(${(i * 20) - 50}px)`, 
                      zIndex: 5 - i,
                      opacity: 1 - (i * 0.15)
                    }}
                  >
                    <img 
                      src={image.src} 
                      alt={`Deep Parallel thought layer ${i+1}`} 
                      className="w-full h-full object-cover rounded-xl"
                      style={{ 
                        filter: i > 0 ? "blur(2px) brightness(1.1)" : "none",
                        mixBlendMode: i > 0 ? "screen" : "normal"
                      }}
                    />
                  </motion.div>
                ))}
                
                {/* Animated data points */}
                {[...Array(20)].map((_, i) => {
                  const x = (Math.random() * 100) - 50;
                  const y = (Math.random() * 100) - 50; 
                  const z = (Math.random() * 100) - 50;
                  const size = 2 + Math.random() * 5;
                  
                  return (
                    <motion.div
                      key={`point-${i}`}
                      className="absolute rounded-full bg-white"
                      style={{ 
                        width: size, 
                        height: size,
                        left: "50%",
                        top: "50%",
                        boxShadow: "0 0 8px 2px rgba(255,255,255,0.8)",
                        translateX: "-50%",
                        translateY: "-50%",
                        translateZ: z,
                        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                      }}
                      animate={{
                        x: [x, x + (Math.random() * 20 - 10)],
                        y: [y, y + (Math.random() * 20 - 10)],
                        opacity: [0.2, 0.8, 0.2],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  );
                })}
              </motion.div>
            </div>
            
            {/* Interactive elements */}
            <motion.div
              className="absolute bottom-4 left-4 right-4 z-30 flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
            >
              {["Neural", "Urban", "Data"].map((type, i) => (
                <div
                  key={type}
                  className={cn(
                    "py-1 px-3 rounded-full text-xs font-medium cursor-pointer transition-all",
                    activeStage === i 
                      ? "bg-white/20 text-white" 
                      : "bg-white/10 text-white/60 hover:bg-white/15"
                  )}
                >
                  {type} Processing
                </div>
              ))}
              
              <div className="ml-auto bg-black/40 py-1 px-3 rounded-full text-xs text-white/70 backdrop-blur-sm border border-white/10">
                Model: Claude 3.7 Opus + TogetherAI
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center"
        >
          <span className="text-white/70 text-sm mb-2">Discover Capabilities</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary animate-pulse"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HeroSection;