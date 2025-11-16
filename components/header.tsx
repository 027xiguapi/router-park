"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sun, Moon } from "lucide-react"
import { Link } from '@/i18n/navigation'
import { useTheme } from "next-themes"
import { useState } from "react"
import { useMonitor } from "@/contexts/monitor-context"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { LocaleSwitcher } from "@/components/locale-switcher"
import LoginModal from '@/components/login/login-modal'

export function Header() {
  const t = useTranslations("headers")
  const { theme, setTheme } = useTheme()
  const { refreshMonitor } = useMonitor()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false)

  const handleRefresh = async () => {
    if (!refreshMonitor) return
    setIsRefreshing(true)
    refreshMonitor()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src='/icon.svg' width="32" height="32" alt='logo' />
            <span className="text-xl font-semibold">{t('brandName')}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/router-monitor" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('apiMonitor')}
            </Link>
            <Link href="/chatgpt-mirrors" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('chatgptMirrors')}
            </Link>
            <Link href="/ai-tools" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('aiGateway')}
            </Link>
            <Link href="/vpn" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('vpn')}
            </Link>
            <Link href="/keyword-tool" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('keywordTool')}
            </Link>
            <Link href="/backlinks" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('backlinks')}
            </Link>
            <Link href="/config-guide" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('configGuide')}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                onClick={() => setIsAnnouncementOpen(true)}
                className="hidden md:inline-flex bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-500"
            >
              {t('joinGroup')}
            </Button>
            <LocaleSwitcher />
            <LoginModal />
            {/* <Button
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex bg-transparent"
              onClick={() => setIsAnnouncementOpen(true)}
            >
              <Bell className="mr-2 h-4 w-4" />
              {t('announcement')}
            </Button> */}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:inline-flex"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 公告弹框 */}
      <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('announcementTitle')}</DialogTitle>
            <DialogDescription>{t('announcementDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <Image
              src="/qq-group.jpg"
              alt={t('qqGroupQR')}
              width={400}
              height={400}
              className="rounded-lg"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
