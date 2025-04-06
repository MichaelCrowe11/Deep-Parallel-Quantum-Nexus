import { MotionProps } from 'framer-motion';

// Fluid fade transitions
export const fadeInUpMotion: MotionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

// Ocean wave effect
export const waveEffectMotion: MotionProps = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

// Neural pulse animation
export const pulseEffectMotion: MotionProps = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

// Thought flow transition
export const flowTransitionMotion: MotionProps = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 15
  }
};

// Processing ripple effect
export const rippleEffect = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

// Hover animation preset
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

// Click animation preset
export const clickEffect = {
  whileTap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Fade In Animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

// Fade In Up Animation
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Fade In Down Animation
export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Scale In Animation
export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

// Stagger Children Animation
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Card Hover Animation
export const cardHover = {
  whileHover: {
    y: -5,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3 }
  }
};

// Button Hover Animation
export const buttonHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.98 }
};

// Rotate Animation
export const rotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Appear From Left
export const appearFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
};

// Appear From Right
export const appearFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
};
