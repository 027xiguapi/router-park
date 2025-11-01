"use client"

import { Card } from "@/components/ui/card"
import { Search, CheckCircle2, Rocket } from "lucide-react"
import { useTranslations } from "next-intl"

const stepIcons = {
  browse: Search,
  details: CheckCircle2,
  start: Rocket,
}

export function HowItWorks() {
  const t = useTranslations("howItWorks")

  const stepKeys = ['browse', 'details', 'start']

  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{t('title')}</h2>
          <p className="text-pretty text-lg text-muted-foreground">{t('description')}</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {stepKeys.map((key, index) => {
            const Icon = stepIcons[key as keyof typeof stepIcons]
            const step = {
              title: t(`steps.${key}.title`),
              description: t(`steps.${key}.description`)
            }
            return (
              <div key={index} className="relative">
                <Card className="relative h-full border-border bg-card p-8">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
                {index < stepKeys.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-0.5 w-8 -translate-y-1/2 translate-x-full bg-border md:block" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
