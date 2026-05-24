/**
 * Landing page composition, assembles all landing sections in order.
 * Each section is a standalone component with its own scroll animations.
 */
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { TechStackSection } from "./TechStackSection";
import { DeepDiveSection } from "./DeepDiveSection";
import { ZeroBackendSection } from "./ZeroBackendSection";
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
    <main className="relative z-10 text-white" role="main">
      <Header onStart={onStart} />
      <HeroSection onStart={onStart} />
      <BentoGridSection />
      <HowItWorksSection />
      <ModelsSection />
      <ComparisonSection />
      <TechStackSection />
      <DeepDiveSection />
      <ZeroBackendSection />
      <FAQSection />
      <CtaSection onStart={onStart} />
      <Footer />
    </main>
  );
}
