import CallToAction from '@/components/landing/call-to-action';
import Features from '@/components/landing/features';
import FooterSection from '@/components/landing/footer';
import { HeroHeader } from '@/components/landing/header';
import HeroSection from '@/components/landing/hero-section';
import Pricing from '@/components/landing/pricing';

export default function Home() {
  return (
    <div>
      <HeroHeader />
      <HeroSection />
      <Features />
      <Pricing />
      <CallToAction />
      <FooterSection />
    </div>
  );
}
