"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useTranslations } from "next-intl"

export function Testimonials() {
  const t = useTranslations("testimonials")

  const userKeys = ['user1', 'user2', 'user3']

  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{t('title')}</h2>
          <p className="text-pretty text-lg text-muted-foreground">{t('description')}</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {userKeys.map((key, index) => {
            const testimonial = {
              name: t(`items.${key}.name`),
              role: t(`items.${key}.role`),
              company: t(`items.${key}.company`),
              content: t(`items.${key}.content`)
            }
            return (
              <Card key={index} className="border-border bg-card p-8">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground">{testimonial.content}</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
