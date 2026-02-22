import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import TrustedBy from '@/components/landing/TrustedBy';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import Differentiation from '@/components/landing/Differentiation';
import PricingSection from '@/components/landing/PricingSection';
import CTABanner from '@/components/landing/CTABanner';
import LandingFooter from '@/components/landing/LandingFooter';

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <TrustedBy />
    <ProblemSection />
    <FeaturesGrid />
    <HowItWorks />
    <Differentiation />
    <PricingSection />
    <CTABanner />
    <LandingFooter />
  </div>
);

export default Index;
