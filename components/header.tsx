"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sun, Moon, Menu, X } from "lucide-react"
import { Link } from '@/i18n/navigation'
import { useTheme } from "next-themes"
import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { LocaleSwitcher } from "@/components/locale-switcher"
import LoginModal from '@/components/login/login-modal'
import { Separator } from "@/components/ui/separator"

export function Header() {
  const t = useTranslations("headers")
  const { theme, setTheme } = useTheme()
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationLinks = [
    { href: "/router-monitor", label: t('apiMonitor') },
    { href: "/chatgpt-mirrors", label: t('chatgptMirrors') },
    { href: "/ai-tools", label: t('aiGateway') },
    { href: "/vpn", label: t('vpn') },
    { href: "/keyword-tool", label: t('keywordTool') },
    { href: "/backlinks", label: t('backlinks') },
    { href: "/config-guide", label: t('configGuide') },
    { href: "/blogs", label: t('blogs') },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src='/icon.svg' width="28" height="28" alt='logo' className="sm:w-8 sm:h-8" />
            <span className="text-base sm:text-xl font-semibold truncate max-w-[120px] sm:max-w-none">{t('brandName')}</span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:text-primary font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 加群按钮 - 仅桌面端显示 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnnouncementOpen(true)}
              className="hidden lg:inline-flex bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-500 border-emerald-500/30 text-xs"
            >
              {t('joinGroup')}
            </Button>

            {/* 语言切换 */}
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>

            {/* 登录按钮 */}
            <LoginModal />

            {/* 主题切换 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:inline-flex h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>

            {/* 移动端菜单按钮 */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">打开菜单</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    <Image src='/icon.svg' width="24" height="24" alt='logo' />
                    {t('brandName')}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-4">
                  {/* 移动端导航链接 */}
                  <nav className="flex flex-col gap-1">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-3 py-2.5 text-sm rounded-lg transition-colors ${
                          link.highlight
                            ? 'text-primary font-medium hover:bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <Separator />

                  {/* 移动端操作按钮 */}
                  <div className="flex flex-col gap-2">
                    {/* 加群按钮 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsAnnouncementOpen(true)
                      }}
                      className="w-full justify-start bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400 border-emerald-500/30"
                    >
                      {t('joinGroup')}
                    </Button>

                    {/* 语言切换 - 仅移动端 */}
                    <div className="sm:hidden w-full">
                      <LocaleSwitcher />
                    </div>

                    {/* 主题切换 - 仅移动端 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="sm:hidden w-full justify-start"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          浅色模式
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          深色模式
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* 公告弹框 */}
      <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{t('announcementTitle')}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">{t('announcementDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 sm:p-4">
            <Image
              src="/qq-group.jpg"
              alt={t('qqGroupQR')}
              width={400}
              height={400}
              className="rounded-lg w-full max-w-[300px] sm:max-w-[400px]"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
