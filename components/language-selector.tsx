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
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <a href="https://fazier.com/launches/routerpark.com" target="_blank">
                  <img
                      src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light"
                      width="150" height="32" alt="Fazier badge"/>
              </a>
              <a href="https://twelve.tools" target="_blank">
                  <img src="https://twelve.tools/badge0-light.svg"
                       alt="Featured on Twelve Tools" width="130"
                       height="32"/></a>
              <a href="https://www.producthunt.com/products/routerpark?utm_source=badge-follow&utm_medium=badge&utm_source=badge-routerpark"
                 target="_blank">
                  <img
                      src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=1131691&theme=light&size=small"
                      alt="RouterPark - Share&#0032;Free&#0032;AI&#0032;Model&#0032;API&#0032;Gateway&#0044;&#0032;Free&#0032;API&#0044;&#0032;Free&#0032;VPN | Product Hunt"
                      width="86" height="32"/>
              </a>
              <a href="https://startupfa.me/s/router-park?utm_source=routerpark.com" target="_blank">
                  <img src="https://startupfa.me/badges/featured-badge.webp" alt="Router Park - Featured on Startup Fame" width="100" height="32" />
              </a>
              <a href="https://www.mogudh.com" target="_blank" className="flex items-center justify-center py-2"><img
                  src="https://www.mogudh.com/static/upload/2025/03/09/202503099918.svg" alt="蘑菇导航Logo" width="27"
                  height="27"/><span className="text-black">蘑菇导航</span></a>
          </div>
      </div>
    </section>
  )
}
