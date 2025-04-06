import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { type Scene } from "@shared/schema";

interface TransitionEffectProps {
  scene: Scene;
  transitionType?: "fade" | "slide" | "zoom" | "dissolve";
  duration?: number;
  children: React.ReactNode;
}

const transitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
  dissolve: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
  },
};

export function TransitionEffect({
  scene,
  transitionType = "fade",
  duration = 0.5,
  children,
}: TransitionEffectProps) {
  const [key, setKey] = useState(scene.id);

  useEffect(() => {
    setKey(scene.id);
  }, [scene.id]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={transitions[transitionType].initial}
        animate={transitions[transitionType].animate}
        exit={transitions[transitionType].exit}
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
