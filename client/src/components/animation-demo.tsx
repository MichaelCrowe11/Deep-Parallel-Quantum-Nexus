import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { BrandButton } from './brand-elements';
import * as animations from '@/lib/animations';

export const AnimationDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <motion.div {...animations.fadeInUp}>
        <h2 className="text-2xl font-bold mb-4">Micro-Animation Showcase</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wave Effect Demo */}
        <motion.div {...animations.waveEffect}>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Wave Effect</h3>
            <p className="text-sm text-muted-foreground">Smooth oceanic motion</p>
          </Card>
        </motion.div>

        {/* Pulse Effect Demo */}
        <motion.div {...animations.pulseEffect}>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Neural Pulse</h3>
            <p className="text-sm text-muted-foreground">Subtle thought processing</p>
          </Card>
        </motion.div>

        {/* Flow Transition Demo */}
        <motion.div {...animations.flowTransition}>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Flow Transition</h3>
            <p className="text-sm text-muted-foreground">Smooth data flow</p>
          </Card>
        </motion.div>

        {/* Ripple Effect Demo */}
        <motion.div {...animations.rippleEffect}>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Processing Ripple</h3>
            <p className="text-sm text-muted-foreground">Dynamic processing indicator</p>
          </Card>
        </motion.div>

        {/* Interactive Hover Demo */}
        <motion.div {...animations.hoverScale}>
          <Card className="p-6 cursor-pointer">
            <h3 className="text-lg font-medium mb-2">Hover Interaction</h3>
            <p className="text-sm text-muted-foreground">Try hovering!</p>
          </Card>
        </motion.div>

        {/* Click Effect Demo */}
        <motion.div {...animations.clickEffect}>
          <Card className="p-6 cursor-pointer">
            <h3 className="text-lg font-medium mb-2">Click Interaction</h3>
            <p className="text-sm text-muted-foreground">Try clicking!</p>
          </Card>
        </motion.div>
      </div>

      <div className="flex gap-4 mt-8">
        <BrandButton variant="primary">
          <motion.span {...animations.pulseEffect}>
            Animated Button
          </motion.span>
        </BrandButton>
      </div>
    </div>
  );
};

export default AnimationDemo;
