'use client';

import { Navbar } from '@/components/navbar';
import HeroSection from '@/components/hero-section';

import { AnimatedBackground } from '@/components/ui/animated-background';
import ContactSection from '@/components/contact-section';

export default function Home() {
  return (
    <AnimatedBackground className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ContactSection />
    </AnimatedBackground>
  );
}