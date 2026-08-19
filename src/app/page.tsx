
import HeroSection from './Components/Home/HeroSection';
import FeaturesSection from './Components/Home/FeaturesSection';
import HowItWorks from './Components/Home/HowItWorks';
import SolutionsSection from './Components/Home/SolutionsSection';
import PricingSection from './Components/Home/PricingSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <SolutionsSection />
      <PricingSection />
    </div>
  );
}
