import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { MonitorDashboard } from '@/components/monitor/monitor-dashboard'
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { FreeVPN } from "@/components/free-vpn"
import { FreeAPIKeys } from "@/components/free-api-keys"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home')

  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  }
}

export default async function Home({
                                       params,
                                       searchParams
                                   }: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ page?: string }>
}) {
    const { locale } = await params
    const { page } = await searchParams
    const currentPage = page ? parseInt(page) : 1
  return (
    <>
      <Hero />
      <MonitorDashboard locale={locale} currentPage={currentPage} />
      <FreeAPIKeys />
      <FreeVPN />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
    </>
  )
}
