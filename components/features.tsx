"use client"

import { Card } from "@/components/ui/card"
import { Search, Filter, Star, TrendingUp, Shield, Zap } from "lucide-react"
import { useTranslations } from "next-intl"

const featureIcons = {
  smartSearch: Search,
  preciseCategories: Filter,
  professionalReview: Star,
  realTimeUpdate: TrendingUp,
  secure: Shield,
  quickAccess: Zap,
}

export function Features() {
  const t = useTranslations("features")

  const featureKeys = ['smartSearch', 'preciseCategories', 'professionalReview', 'realTimeUpdate', 'secure', 'quickAccess']

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">{t('description')}</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[key as keyof typeof featureIcons]
            const feature = {
              title: t(`items.${key}.title`),
              description: t(`items.${key}.description`)
            }
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-border bg-card p-8 transition-all hover:border-accent/50 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
