import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CircularEnergyLoader } from './circular-energy-loader';

interface VideoData {
  id: string;
  src: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
}

interface VideoShowcaseProps {
  videos: VideoData[];
  className?: string;
}

const VideoPlayer = ({ video, onClose, onNext, onPrev, hasNext, hasPrev }: { 
  video: VideoData; 
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [video.src]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-lg"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-6xl p-4">
        {/* Video title bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h3 className="text-xl font-bold text-white">{video.title}</h3>
            <p className="text-sm text-gray-300">{video.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </motion.div>

        {/* Video container */}
        <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CircularEnergyLoader type="thought" message="Loading video..." />
            </div>
          )}

          {/* Video element */}
          <video
            ref={videoRef}
            src={video.src}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />

          {/* Overlay for play/pause control */}
          <div 
            className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            onClick={togglePlayPause}
          >
            {!isPlaying && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 bg-black/30 backdrop-blur-sm rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Navigation controls */}
          <div className="absolute inset-x-0 bottom-16 flex justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              disabled={!hasPrev}
              className={cn(
                "p-2 bg-black/50 backdrop-blur-sm rounded-full text-white",
                !hasPrev && "opacity-50 cursor-not-allowed"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              disabled={!hasNext}
              className={cn(
                "p-2 bg-black/50 backdrop-blur-sm rounded-full text-white",
                !hasNext && "opacity-50 cursor-not-allowed"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoShowcase: React.FC<VideoShowcaseProps> = ({ videos, className }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];
  
  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === activeCategory);

  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video);
    const index = filteredVideos.findIndex(v => v.id === video.id);
    setCurrentVideoIndex(index);
  };

  const handleNext = () => {
    if (currentVideoIndex < filteredVideos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setSelectedVideo(filteredVideos[currentVideoIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setSelectedVideo(filteredVideos[currentVideoIndex - 1]);
    }
  };

  return (
    <div className={cn("space-y-8", className)} id="video-showcase">
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
        >
          Revolutionary AI-Generated Videos
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-lg text-gray-300 max-w-3xl mx-auto"
        >
          Experience the world's first multi-stage AI thought pipeline generating videos with unprecedented coherence and creativity
        </motion.p>
      </div>

      {/* Category selector */}
      <div className="flex justify-center flex-wrap gap-2 pb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeCategory === category
                ? "bg-primary/20 border border-primary/40 text-white"
                : "bg-black/20 border border-white/10 text-gray-300 hover:bg-black/30"
            )}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden"
          >
            <div 
              className="aspect-video bg-black/50 cursor-pointer relative group"
              onClick={() => handleVideoSelect(video)}
            >
              {/* Thumbnail or video preview */}
              {video.thumbnail ? (
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <video 
                  src={video.src} 
                  className="w-full h-full object-cover" 
                  muted 
                  loop
                  preload="metadata"
                />
              )}
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-4 bg-primary/30 backdrop-blur-sm rounded-full transform scale-75 group-hover:scale-100 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-white mb-1">{video.title}</h3>
              <p className="text-sm text-gray-300">{video.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-primary/80 font-medium px-2 py-1 bg-primary/10 rounded-full">
                  {video.category}
                </span>
                
                <button
                  onClick={() => handleVideoSelect(video)}
                  className="text-xs text-white font-medium hover:text-primary/80 transition-colors"
                >
                  Watch Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Full screen video player */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer 
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={currentVideoIndex < filteredVideos.length - 1}
            hasPrev={currentVideoIndex > 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoShowcase;