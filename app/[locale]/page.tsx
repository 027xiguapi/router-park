import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { MonitorDashboard } from '@/components/monitor/monitor-dashboard'
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { FreeVPN } from "@/components/free-vpn"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home')

  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  }
}

export default async function Home() {
  return (
    <>
      <Hero />
      <MonitorDashboard />
      <FreeVPN />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
    </>
  )
}
