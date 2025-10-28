"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles, Bell, Plus, RefreshCw, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useMonitor } from "@/contexts/monitor-context"
import Image from "next/image"

export function Header() {
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
            <span className="text-xl font-semibold">AI 接口中转网站</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/api-monitor" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              API 监控
            </Link>
            <Link href="/chatgpt-mirrors" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              ChatGPT 镜像
            </Link>
            <Link href="/ai-tools" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              大模型接口网关
            </Link>
            <Link href="/vpn-recommend" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              VPN 推荐
            </Link>
            <Link href="/config-guide" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              配置指南
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex bg-transparent"
              onClick={() => setIsAnnouncementOpen(true)}
            >
              <Bell className="mr-2 h-4 w-4" />
              公告
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnnouncementOpen(true)}
                className="hidden md:inline-flex bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              进群
            </Button>
            {/*{refreshMonitor && (*/}
            {/*    <Button*/}
            {/*      variant="outline"*/}
            {/*      size="sm"*/}
            {/*      onClick={handleRefresh}*/}
            {/*      disabled={isRefreshing}*/}
            {/*      className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400"*/}
            {/*    >*/}
            {/*      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />*/}
            {/*      <span className="hidden sm:inline">刷新</span>*/}
            {/*    </Button>*/}
            {/*)}*/}
            {/*{!refreshMonitor && (*/}
            {/*  <>*/}
            {/*    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">*/}
            {/*      登录*/}
            {/*    </Button>*/}
            {/*    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">*/}
            {/*      免费试用*/}
            {/*    </Button>*/}
            {/*  </>*/}
            {/*)}*/}
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
            <DialogTitle>公告通知</DialogTitle>
            <DialogDescription>扫码加入我们的 QQ 群</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <Image
              src="/qq-group.jpg"
              alt="QQ群二维码"
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
