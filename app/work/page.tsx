import { Navigation } from "@/components/navigation"
import { WorkShowcase } from "@/components/work-showcase"
import { Footer } from "@/components/footer"

export default function WorkPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <WorkShowcase />
      <Footer />
    </main>
  )
}
