import PublicLayout from '../layouts/PublicLayout.jsx'
import CurtainReveal from '../components/landing/CurtainReveal.jsx'
import HeroSection from '../components/landing/HeroSection.jsx'
import ParallaxWorkflow from '../components/landing/ParallaxWorkflow.jsx'
import ComparisonSection from '../components/landing/ComparisonSection.jsx'
import ProductModulesSection from '../components/landing/ProductModulesSection.jsx'
import TechStackOrbit from '../components/landing/TechStackOrbit.jsx'
import FinalCTASection from '../components/landing/FinalCTASection.jsx'

function LandingPage() {
  return (
    <PublicLayout>
      <CurtainReveal />
      <main>
        <HeroSection />
        <ParallaxWorkflow />
        <ComparisonSection />
        <ProductModulesSection />
        <TechStackOrbit />
        <FinalCTASection />
      </main>
    </PublicLayout>
  )
}

export default LandingPage
