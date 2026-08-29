import HeroSection from './Components/Home/HeroSection';
import FeaturesSection from './Components/Home/FeaturesSection';
import HowItWorks from './Components/Home/HowItWorks';
import SolutionsSection from './Components/Home/SolutionsSection';
import PricingSection from './Components/Home/PricingSection';
import AffiliateSection from './Components/Home/AffiliateSection';
import FaqSection from './Components/Home/FaqSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <SolutionsSection />
      <PricingSection />
      {/* <AffiliateSection /> */}
      <FaqSection />
    </div>
  );
}
