import { getDailySummaryData } from '@/lib/daily-log'
import { DailyLogContent } from '@/components/daily-log-content'
import { getTranslations } from 'next-intl/server'
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dailyLog')

  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  }
}

export default async function DailyLogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const summaryData = await getDailySummaryData()

  return <DailyLogContent data={summaryData} locale={locale} />
}
