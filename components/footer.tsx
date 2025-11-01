"use client"

import { Link } from '@/i18n/navigation'
import Image from "next/image"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 flex items-center gap-2">
                <Image src='/icon.svg' width="32" height="32" alt='logo' />
                <span className="text-xl font-semibold">{t('brandName')}</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                {t('description.line1')}
                <br />
                {t('description.line2')}
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">{t('products.title')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('products.features')}
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('products.pricing')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('products.changelog')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">{t('resources.title')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('resources.documentation')}
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('resources.faq')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('resources.blog')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">{t('contact.title')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:xxxx@gmail.com"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t('contact.email')}
                  </a>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('contact.aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t('contact.joinUs')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">{t('copyright')}</p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                {t('legal.privacyPolicy')}
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                {t('legal.termsOfService')}
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                {t('legal.cookiePolicy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
