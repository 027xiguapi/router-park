import { Hero } from "@/components/hero"
import { MonitorDashboard } from "@/components/monitor/monitor-dashboard"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <MonitorDashboard />
      <Features />
      <HowItWorks />
      <Testimonials />
      {/*<Pricing />*/}
      <FAQ />
    </main>
  )
}
