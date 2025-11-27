'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'
import { startTransition } from 'react'
import { useParams } from 'next/navigation'
import { Locale } from 'next-intl'

export function LanguageSelectorSection() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  function onLocaleSelect(newLocale: Locale) {
    if (newLocale === locale) return

    startTransition(() => {
      router.replace(
        { pathname, params },
        { locale: newLocale }
      )
    })
  }

  return (
    <section className="py-12 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {locales.map((lang) => {
            const isActive = locale === lang.code

            return (
              <Button
                key={lang.code}
                onClick={() => onLocaleSelect(lang.code)}
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
            )
          })}
        </div>
      </div>
    </section>
  )
}
