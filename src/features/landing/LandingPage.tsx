'use client';

import { Hero } from './sections/Hero';
import { CliQuickstartSection } from './sections/CliQuickstartSection';
import { Problem } from './sections/Problem';
import { TerminalDemo } from './sections/TerminalDemo';
import { GithubConnectSection } from './sections/GithubConnectSection';
import { HowItWorks } from './sections/HowItWorks';
import { Features } from './sections/Features';
import { Audience } from './sections/Audience';
import { Roadmap } from './sections/Roadmap';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';

export function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#1A1A1A', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <Hero />
      <Problem />
      <TerminalDemo />
      <CliQuickstartSection />
      <GithubConnectSection />
      <HowItWorks />
      <Features />
      <Audience />
      <Roadmap />
      <FinalCTA />
      <Footer />
    </div>
  );
}
