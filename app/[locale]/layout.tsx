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
import { InviteCodeHandler } from '@/components/invite-code-handler'
import { AutoApplyInvite } from '@/components/auto-apply-invite'

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
        {/* 广告拦截收入挽回 */}
        <script async src="https://fundingchoicesmessages.google.com/i/pub-5878114055897626?ers=1"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function signalGooglefcPresent() {
                  if (!window.frames['googlefcPresent']) {
                    if (document.body) {
                      const iframe = document.createElement('iframe');
                      iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
                      iframe.style.display = 'none';
                      iframe.name = 'googlefcPresent';
                      document.body.appendChild(iframe);
                    } else {
                      setTimeout(signalGooglefcPresent, 0);
                    }
                  }
                }
                signalGooglefcPresent();
              })();
            `
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SessionProvider>
            <UserProvider>
              <InviteCodeHandler />
              <AutoApplyInvite />
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
