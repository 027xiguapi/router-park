import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "../globals.css"
import { GoogleAnalytics } from '@next/third-parties/google'
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import { locales, routing } from '@/i18n/routing'

import type { Metadata } from 'next'

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' },
    { locale: 'ja' },
    { locale: 'ko' },
    { locale: 'es' },
    { locale: 'fr' },
    { locale: 'de' },
    { locale: 'it' },
    { locale: 'ru' },
    { locale: 'pt' },
    { locale: 'ar' },
    { locale: 'hi' }
  ]
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'siteInfo' })

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    generator: "v0.app",
  }
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const currentLocale = locales.find((l) => l.code === locale)

  return (
    <html lang={currentLocale?.code ?? 'en'} dir={currentLocale?.dir || 'ltr'} suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5878114055897626"
              crossOrigin="anonymous"></script>
      </head>
      <body className={`font-sans antialiased`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <Header/>
        {children}
        <Footer/>
      </ThemeProvider>
      <Analytics/>
      </body>
      <GoogleAnalytics gaId="G-PNRXSJMSV6"/>
      </html>
  )
}
