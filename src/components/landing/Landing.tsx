/**
 * Landing page composition, assembles all landing sections in order.
 * Each section is a standalone component with its own scroll animations.
 */
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { TechStackSection } from "./TechStackSection";
import { DeepDiveSection } from "./DeepDiveSection";
import { BentoGridSection } from "./BentoGridSection";
import { ComparisonSection } from "./ComparisonSection";
import { ModelsSection } from "./ModelsSection";
import { FAQSection } from "./FAQSection";
import { CtaSection } from "./CtaSection";
import { Footer } from "./Footer";

interface LandingProps {
  onStart: () => void;
}

export function Landing({ onStart }: LandingProps) {
  return (
    <div className="relative z-10 text-white">
      <HeroSection onStart={onStart} />
      <BentoGridSection />
      <HowItWorksSection />
      <ModelsSection />
      <ComparisonSection />
      <TechStackSection />
      <DeepDiveSection />
      <FAQSection />
      <CtaSection onStart={onStart} />
      <Footer />
    </div>
  );
}
