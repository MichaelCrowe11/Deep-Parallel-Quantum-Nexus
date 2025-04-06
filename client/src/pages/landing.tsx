import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Cpu, Network, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { IMAGES, VIDEOS } from '@/config/assets';
import ShowcaseGallery from '@/components/showcase-gallery';
import VideoShowcase from '@/components/video-showcase';
import SiteHeader from '@/components/site-header';
import { DeepParallelFont } from '@/components/deep-parallel-font';
import HeroSection from '@/components/hero-section';
import { cn } from '@/lib/utils';

// Feature card component with improved visual hierarchy
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor?: string;
}> = ({ 
  icon, 
  title, 
  description, 
  accentColor = "rgba(43, 135, 255, 0.1)" 
}) => {
  // Memoize the component to prevent unnecessary re-renders
  return useMemo(() => (
    <motion.div 
      whileHover={{ y: -5, boxShadow: `0 10px 25px -5px ${accentColor}` }}
      className={cn(
        "bg-[#121820] p-6 rounded-lg border border-[#2b87ff]/10",
        "transition-all duration-300 ease-in-out",
        "backdrop-blur-sm relative overflow-hidden"
      )}
    >
      <div className="mb-4 relative z-10">{icon}</div>
      <h3 className="text-xl font-medium mb-2 text-white relative z-10">{title}</h3>
      <p className="text-gray-400 relative z-10">{description}</p>
      
      {/* Background accent glow for aesthetic depth */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: accentColor, filter: 'blur(40px)' }} 
      />
    </motion.div>
  ), [icon, title, description, accentColor]);
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1015] to-[#121820]">
      {/* Site Header */}
      <SiteHeader />
      
      {/* Advanced Hero Section with Neural Network Visualization */}
      <HeroSection />
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0c1015]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Advanced AI Thought Pipeline
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our revolutionary multi-stage processing system delivers unprecedented depth and coherence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Brain className="w-8 h-8 text-[#2b87ff]" />}
              title="Deep Pattern Enhancement"
              description="Identify and amplify underlying patterns for deeper insight generation"
              accentColor="rgba(43, 135, 255, 0.2)"
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-[#6d56f9]" />}
              title="Multi-Stage Synthesis"
              description="Process information through multiple specialized AI stages for comprehensive results"
              accentColor="rgba(109, 86, 249, 0.2)"
            />
            <FeatureCard 
              icon={<Cpu className="w-8 h-8 text-[#00d8ff]" />}
              title="Neural Current Processing"
              description="Leverage parallel model workflows for superior analysis and creation"
              accentColor="rgba(0, 216, 255, 0.2)"
            />
            <FeatureCard 
              icon={<Network className="w-8 h-8 text-[#2b87ff]" />}
              title="Thought Flow Visualization"
              description="Transform abstract concepts into compelling visual narratives"
              accentColor="rgba(43, 135, 255, 0.2)"
            />
          </div>
        </div>
      </section>
      
      {/* Urban Showcase Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25">
          <img 
            src={IMAGES.categories.urban[0].src}
            alt="Urban data visualization" 
            className="w-full h-full object-cover"
            style={{ filter: "blur(3px)" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1015]/95 via-[#0c1015]/80 to-[#0c1015]/95 z-10"></div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">Transform Research Into Visual Experiences</h2>
              <p className="text-gray-400 mb-8">
                Our AI thought pipeline powers the transformation of complex research concepts into rich, coherent visual narratives. Experience the future of content creation.
              </p>
              <ul className="space-y-4">
                {[
                  "Parallel model processing for superior depth",
                  "Multi-stage pipeline for coherent narratives",
                  "Seamless integration with existing workflows",
                  "Revolutionary visual synthesis capabilities"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 text-[#2b87ff]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.66675 10.1147L12.7947 3.98599L13.7381 4.92866L6.66675 12L2.42875 7.76199L3.37141 6.81933L6.66675 10.1147Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <a href="#showcase" className="inline-flex items-center text-[#2b87ff] font-medium hover:text-[#1a76ee] transition-colors">
                  Explore our showcase
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="bg-[#121820]/70 backdrop-blur-md rounded-lg p-1 shadow-lg overflow-hidden">
              <div className="aspect-video rounded overflow-hidden">
                <img 
                  src={IMAGES.categories.urban[2].src}
                  alt="Smart city visualization" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Video Showcase - Deep Parallel's Revolutionary AI Videos */}
      <section id="video-showcase" className="py-24 bg-gradient-to-b from-[#050a15] to-[#0c1015] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Using the video data from our assets configuration */}
          <VideoShowcase videos={VIDEOS} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </section>
      
      {/* Showcase Gallery */}
      <section id="showcase" className="py-20 bg-[#0c1015]">
        <div className="container mx-auto px-4">
          <ShowcaseGallery />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0c246d] to-[#1a3a7d]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Transform Your Process?</h2>
          <p className="text-gray-200 mb-10 max-w-2xl mx-auto">
            Join leading organizations using our AI thought pipeline to create extraordinary visual experiences
          </p>
          <Link href="/login">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-[#0c246d] font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </motion.button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 bg-[#080b10]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <DeepParallelFont 
                variant="minimal" 
                size="md" 
                color="light" 
              />
              <p className="text-gray-400 text-sm mt-2">
                Advanced AI Thought Pipeline for Visual Storytelling
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
              <div>
                <h3 className="text-white font-medium mb-4">Platform</h3>
                <ul className="space-y-2">
                  {['Features', 'Showcase', 'Dashboard', 'Login'].map(item => (
                    <li key={item}>
                      <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-gray-300 text-sm">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  {['About', 'Blog', 'Careers', 'Contact'].map(item => (
                    <li key={item}>
                      <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-gray-300 text-sm">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Legal</h3>
                <ul className="space-y-2">
                  {['Privacy', 'Terms', 'Security', 'Cookies'].map(item => (
                    <li key={item}>
                      <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-gray-300 text-sm">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Deep Parallel AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;