import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { WorkShowcase } from "@/components/work-showcase"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { MouseParticles } from "@/components/mouse-particles"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <MouseParticles />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <WorkShowcase />
      <ContactSection />
      <Footer />
    </main>
  )
}
