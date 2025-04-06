import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import * as animations from "@/lib/animations";
import { useState, useMemo, useCallback } from "react";
import { IMAGES } from "@/config/assets";
import { Image } from "@/components/ui/image";
import { DeepVisualization } from "@/components/deep-visualizations";
import { cn } from "@/lib/utils";

interface ShowcaseImage {
  src: string;
  alt: string;
  description: string;
  category: "thought" | "urban" | "data";
}

const ShowcaseGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | ShowcaseImage["category"]>("all");
  const [selectedImage, setSelectedImage] = useState<ShowcaseImage | null>(null);

  // Type assertion to ensure the showcaseImages conform to the ShowcaseImage interface
  const showcaseImages = IMAGES.showcase as ShowcaseImage[];

  const filteredImages = selectedCategory === "all" 
    ? showcaseImages 
    : showcaseImages.filter(img => img.category === selectedCategory);

  return (
    <div id="showcase" className="space-y-8 bg-background/80 backdrop-blur-lg rounded-xl p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-6 mb-10">
          <DeepVisualization 
            type="deep-synthesis" 
            size="lg" 
            animated={true}
            className="hidden md:block"
          />
          <div>
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#2b87ff] via-[#6d56f9] to-[#00d8ff] bg-clip-text text-transparent inline-block">
              Deep Parallel Thought Visualization
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">
              Experience our groundbreaking AI-powered multi-stage thought pipeline that transforms abstract concepts into compelling visual narratives
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {useMemo(() => 
            ["all", "thought", "urban", "data"].map((category) => {
              // Map different visualization types based on category
              const visualizationType = 
                category === "thought" ? "concept-enhancement" :
                category === "urban" ? "parallel-processing" :
                category === "data" ? "performance-metrics" : "multi-stage";
              
              return (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category as typeof selectedCategory)}
                  className={cn(
                    "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    selectedCategory === category 
                      ? "bg-[#2b87ff] text-white shadow-lg shadow-[#2b87ff]/20" 
                      : "bg-background/50 text-gray-400 hover:bg-[#2b87ff]/10 hover:text-gray-300"
                  )}
                >
                  {category !== "all" && (
                    <DeepVisualization 
                      type={visualizationType as any}
                      size="sm"
                      animated={selectedCategory === category}
                      className="w-5 h-5"
                    />
                  )}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              );
            }), [selectedCategory])
          }
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredImages.map((image, index) => {
            // Define a color accent based on the category
            const accentColor = useMemo(() => {
              switch(image.category) {
                case 'thought': return 'rgba(109, 86, 249, 0.8)';
                case 'urban': return 'rgba(0, 216, 255, 0.8)';
                case 'data': return 'rgba(43, 135, 255, 0.8)';
                default: return 'rgba(43, 135, 255, 0.8)';
              }
            }, [image.category]);
            
            // Get visualization type based on category
            const visualizationType = useMemo(() => {
              switch(image.category) {
                case 'thought': return 'concept-enhancement';
                case 'urban': return 'parallel-processing';
                case 'data': return 'performance-metrics';
                default: return 'multi-stage';
              }
            }, [image.category]) as any;
            
            return (
              <motion.div
                key={image.src}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.4
                }}
                onClick={() => setSelectedImage(image)}
                className="cursor-pointer group"
              >
                <Card className={cn(
                  "overflow-hidden bg-background/50 backdrop-blur-sm",
                  "border border-[#2b87ff]/10 hover:border-[#2b87ff]/40",
                  "transition-all duration-300 hover:shadow-lg",
                  "transform-gpu hover:-translate-y-1 hover:scale-[1.02]"
                )}>
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-700"
                    />
                    
                    {/* Advanced overlay with gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a14]/90 via-[#050a14]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    
                    {/* Category badge with visualization icon */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <DeepVisualization 
                        type={visualizationType}
                        size="sm"
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-white/90">
                        {image.category.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Content info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-medium text-white mb-1.5 line-clamp-2">{image.description}</p>
                      
                      {/* Action button that appears on hover */}
                      <div className="flex items-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
                        <span className="text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium inline-flex items-center gap-1">
                          View Details
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                    
                    {/* Accent color glow */}
                    <div 
                      className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ background: accentColor, filter: 'blur(25px)' }}
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          {/* Enhanced detail view modal */}
          <motion.div
            className="relative max-w-5xl w-full bg-[#0c1015]/80 rounded-xl backdrop-blur-lg overflow-hidden shadow-2xl border border-[#2b87ff]/20"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", damping: 25 }}
          >
            {/* Close button with improved design */}
            <button 
              className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-[#2b87ff] transition-all duration-300 shadow-lg hover:shadow-[#2b87ff]/25"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image section */}
              <div className="relative aspect-video lg:aspect-auto lg:h-[60vh] overflow-hidden">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full h-full object-cover"
                />
                
                {/* Get visualization type based on category */}
                {(() => {
                  const visualizationType = 
                    selectedImage.category === 'thought' ? 'concept-enhancement' :
                    selectedImage.category === 'urban' ? 'parallel-processing' :
                    selectedImage.category === 'data' ? 'performance-metrics' : 'multi-stage';
                  
                  return (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <DeepVisualization 
                        type={visualizationType as any}
                        size="sm"
                        animated={true}
                        className="w-5 h-5"
                      />
                      <span className="text-xs font-semibold text-white">
                        {selectedImage.category.toUpperCase()}
                      </span>
                    </div>
                  );
                })()}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c1015]/80 to-transparent lg:bg-gradient-to-b lg:from-transparent lg:to-[#0c1015]"></div>
              </div>
              
              {/* Content section */}
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{selectedImage.alt}</h3>
                <p className="text-lg text-gray-300 mb-6">{selectedImage.description}</p>
                
                {/* Additional deep parallel info based on category */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-[#2b87ff]">Generation Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      // Generate appropriate metadata based on category
                      const metadataFields = [
                        { label: "Processing Type", value: selectedImage.category === 'thought' ? "Deep Synthesis" : selectedImage.category === 'urban' ? "Spatial Analysis" : "Data Visualization" },
                        { label: "Model Pipeline", value: "Advanced Multi-Stage" },
                        { label: "Visual Coherence", value: "98%" },
                        { label: "Generation Time", value: "2.4s" }
                      ];
                      
                      return metadataFields.map((field, idx) => (
                        <div key={idx} className="bg-[#121820]/80 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                          <p className="text-sm font-medium text-white">{field.value}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-auto">
                  <button className="px-4 py-2 bg-[#2b87ff] text-white rounded-lg text-sm font-medium hover:bg-[#2b87ff]/90 transition-colors">
                    Download Image
                  </button>
                  <button className="px-4 py-2 bg-transparent border border-[#2b87ff]/50 text-[#2b87ff] rounded-lg text-sm font-medium hover:bg-[#2b87ff]/10 transition-colors">
                    View Generation Process
                  </button>
                </div>
              </div>
            </div>
            
            {/* Visual decorative element - accent corner */}
            <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 100V30C0 13.4315 13.4315 0 30 0H100V100H0Z" fill="url(#paint0_linear)" fillOpacity="0.1"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2b87ff" stopOpacity="0"/>
                    <stop offset="1" stopColor="#2b87ff"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ShowcaseGallery;