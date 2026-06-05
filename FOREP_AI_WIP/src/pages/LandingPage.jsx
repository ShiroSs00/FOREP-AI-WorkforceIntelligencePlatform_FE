import PublicLayout from '../layouts/PublicLayout.jsx'
import CurtainReveal from '../components/landing/CurtainReveal.jsx'
import HeroSection from '../components/landing/HeroSection.jsx'
import ScrollytellingSections from '../components/landing/ScrollytellingSections.jsx'

function LandingPage() {
  return (
    <PublicLayout>
      <CurtainReveal />
      <main>
        <HeroSection />
        <ScrollytellingSections />
      </main>
    </PublicLayout>
  )
}

export default LandingPage
