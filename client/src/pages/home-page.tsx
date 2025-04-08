import HeroSection from "@/components/home/hero-section";
import ServiceSearch from "@/components/home/service-search";
import ServiceCategories from "@/components/home/service-categories";
import FeaturedProviders from "@/components/home/featured-providers";
import HowItWorks from "@/components/home/how-it-works";
import ProviderPromotion from "@/components/home/provider-promotion";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ServiceSearch />
      <ServiceCategories />
      <FeaturedProviders />
      <HowItWorks />
      <ProviderPromotion />
      <Testimonials />
      <CTASection />
    </div>
  );
}
