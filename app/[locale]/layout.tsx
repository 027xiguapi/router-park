import { notFound } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "../globals.css"
import { GoogleAnalytics } from '@next/third-parties/google'
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import { UserProvider } from '@/contexts/user-context'
import { Toaster } from '@/components/ui/sonner'
import { locales, routing } from '@/i18n/routing'

import type { Metadata } from 'next'
import { getMessages } from 'next-intl/server'

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'siteInfo' })

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
    title: t('meta.title'),
    description: t('meta.description'),
    icons: {
      icon: '/favicon.ico'
    },
    authors: [{ name: 'Felix' }],
    creator: 'Felix',
    openGraph: {
      images: ['/logo.svg']
    },
    alternates: {
      languages: {
        'x-default': process.env.NEXT_PUBLIC_BASE_URL,
        ...Object.fromEntries(
            locales.map((locale) => [locale.code, `${process.env.NEXT_PUBLIC_BASE_URL}${locale.code}`])
        )
      }
    }
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
  const messages = await getMessages()

  return (
    <html lang={currentLocale?.code ?? 'en'} dir={currentLocale?.dir || 'ltr'} suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5878114055897626"
              crossOrigin="anonymous"></script>
      </head>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SessionProvider>
            <UserProvider>
              <Header/>
              {children}
              <Toaster position="top-center" closeButton richColors />
              <Footer/>
            </UserProvider>
            </SessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      <Analytics/>
      </body>
      <GoogleAnalytics gaId="G-PNRXSJMSV6"/>
      </html>
  )
}
