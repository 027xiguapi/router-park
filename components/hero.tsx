"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Gift, Key } from "lucide-react"
import { Link } from '@/i18n/navigation'
import { useTranslations } from "next-intl"

export function Hero() {
  const t = useTranslations("hero")

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{t('tagline')}</span>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {t('title')}
          </h1>

          <p className="mb-10 text-pretty text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            {t('description')}
            <br className="hidden sm:inline" />
            {t('description2')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 gap-2 bg-accent px-8 text-base text-accent-foreground hover:bg-accent/90" asChild>
              <Link href="#monitor">
                {t('viewApiList')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
              <Link href="/config-guide">{t('documentation')}</Link>
            </Button>
            <Button
                size="lg"
                className="border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/50 text-green-700 dark:text-green-400"
                onClick={() => scrollToSection('free-api-keys')}
            >
              <Key className="h-4 w-4" />
              免费 API Keys
            </Button>
            <Button
                size="lg"
                className="border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                onClick={() => scrollToSection('free-vpn')}
            >
              <Gift className="h-4 w-4" />
              免费 VPN
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>{t('realtimeMonitoring')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>{t('highAvailability')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>{t('competitivePricing')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
