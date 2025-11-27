'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { locales } from '@/i18n/routing'

export function LanguageSelector() {
  const locale = useLocale()

  return (
    <section className="py-12 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {locales.map((lang) => {
            const isActive = locale === lang.code

            return (
                <Link key={lang.code} href={`/${lang.code}`}>
                  <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`
                  relative transition-all duration-200
                  ${isActive
                          ? 'shadow-md'
                          : 'hover:border-primary/50'
                      }
                `}
                      dir={lang.dir}
                  >
                    {isActive && (
                        <Check className="h-3 w-3 mr-1.5" />
                    )}
                    <span className="text-xs font-mono uppercase mr-1.5 opacity-70">
                  {lang.code}
                </span>
                    <span className="font-medium">
                  {lang.name}
                </span>
                  </Button>
                </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
