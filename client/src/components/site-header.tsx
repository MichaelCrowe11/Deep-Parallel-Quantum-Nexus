import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { DeepParallelFont } from './deep-parallel-font';
import { motion } from 'framer-motion';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  
  // Track scroll position to change header styling
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/90 backdrop-blur-md py-3 shadow-md' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and branding */}
          <Link href="/">
            <div className="flex items-center space-x-2 hover:opacity-90 transition-opacity cursor-pointer">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2b87ff] to-[#6d56f9] flex items-center justify-center"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="text-white"
                >
                  <path 
                    d="M12 4V20M4 12H20M7 7L17 17M17 7L7 17" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                </svg>
              </motion.div>
              <DeepParallelFont 
                variant="stylized" 
                size="md" 
                color="light" 
                animated={false}
              />
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'Showcase', href: '/#showcase', isHashLink: true },
              { label: 'Features', href: '/#features', isHashLink: true },
              { label: 'Dashboard', href: '/dashboard' },
            ].map((item) => (
              item.isHashLink ? (
                <a 
                  key={item.label}
                  href={item.href}
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  {item.label}
                </a>
              ) : (
                <Link 
                  key={item.label}
                  href={item.href}
                >
                  <span className="text-white/80 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              )
            ))}
          </nav>
          
          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white/90 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              >
                Login
              </motion.div>
            </Link>
            
            <Link href="/login">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#2b87ff] hover:bg-[#1a76ee] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                Get Started
              </motion.div>
            </Link>

            {/* Direct link to Thought Processor */}
            <Link href="/project/1">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                Thought Processor
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;