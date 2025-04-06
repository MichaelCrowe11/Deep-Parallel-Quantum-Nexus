import React from 'react';
import { GradientText, BrandButton, BrandCard, BrandIcon, HexagonBackground } from './brand-elements';
import { Brain, Waves, Lightbulb, Network } from 'lucide-react';
import '../styles/brand.css';

export const BrandKit: React.FC = () => {
  return (
    <div className="p-8 min-h-screen bg-background">
      <HexagonBackground className="fixed inset-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Brand Identity */}
        <section>
          <GradientText>
            <h1 className="text-4xl font-black mb-2">DeepParallel</h1>
          </GradientText>
          <p className="text-xl text-muted-foreground">Illuminating Ideas, Transforming Understanding</p>
          <p className="text-sm text-muted-foreground mt-2">deepparallel.io</p>
        </section>

        {/* Logo Showcase */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Logo Variations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <BrandCard className="p-6 flex items-center justify-center">
              <img src="/brand/logo.svg" alt="Primary Logo" className="w-32 h-32" />
            </BrandCard>
            <BrandCard className="p-6 flex items-center justify-center bg-primary">
              <img src="/brand/logo.svg" alt="Light Logo" className="w-32 h-32 filter brightness-200" />
            </BrandCard>
            <BrandCard className="p-6 flex items-center justify-center bg-white">
              <img src="/brand/logo.svg" alt="Dark Logo" className="w-32 h-32 filter brightness-0" />
            </BrandCard>
            <BrandCard className="p-6 flex items-center justify-center">
              <img src="/brand/logo.svg" alt="Monochrome Logo" className="w-32 h-32 filter grayscale" />
            </BrandCard>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-primary"></div>
              <p className="text-sm font-medium">Deep Ocean Blue</p>
              <p className="text-xs text-muted-foreground">hsl(200, 100%, 60%)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-secondary"></div>
              <p className="text-sm font-medium">Neural Current</p>
              <p className="text-xs text-muted-foreground">hsl(220, 100%, 50%)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-accent"></div>
              <p className="text-sm font-medium">Insight Aqua</p>
              <p className="text-xs text-muted-foreground">hsl(180, 100%, 65%)</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-black">Display Heading</h1>
              <p className="text-sm text-muted-foreground">Inter Black / 36px</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Section Heading</h2>
              <p className="text-sm text-muted-foreground">Inter Bold / 30px</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Subsection Heading</h3>
              <p className="text-sm text-muted-foreground">Inter Semibold / 24px</p>
            </div>
            <div>
              <p className="text-base">Body Text - Regular. Our brand represents the illumination of ideas and transformative synthesis.</p>
              <p className="text-sm text-muted-foreground">Inter Regular / 16px</p>
            </div>
          </div>
        </section>

        {/* UI Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">UI Components</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Buttons</h3>
              <div className="space-y-2">
                <BrandButton variant="primary">Primary Action</BrandButton>
                <BrandButton variant="neural">Process Data</BrandButton>
                <BrandButton variant="insight">Generate</BrandButton>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Icons</h3>
              <div className="grid grid-cols-2 gap-4">
                <BrandIcon icon={<Brain />} variant="primary" />
                <BrandIcon icon={<Waves />} variant="neural" />
                <BrandIcon icon={<Lightbulb />} variant="insight" />
                <BrandIcon icon={<Network />} variant="primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Cards</h3>
              <BrandCard className="p-4">
                <h4 className="font-medium mb-2">Sample Card</h4>
                <p className="text-sm text-muted-foreground">Showcasing our card component with brand styling.</p>
              </BrandCard>
            </div>
          </div>
        </section>

        {/* Animation Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Animated Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BrandCard className="p-6 overflow-hidden">
              <div className="brand-gradient animate-pulse w-full h-32 rounded-lg"></div>
              <p className="mt-4 text-sm text-muted-foreground">Animated Processing Gradient</p>
            </BrandCard>
            <BrandCard className="p-6">
              <div className="hexagon-pattern w-full h-32 rounded-lg"></div>
              <p className="mt-4 text-sm text-muted-foreground">Neural Pattern Background</p>
            </BrandCard>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BrandKit;