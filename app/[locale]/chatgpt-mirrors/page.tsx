"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { chatgptMirrors } from "@/lib/chatgpt-mirrors-data"
import { MirrorCard } from "@/components/chatgpt-mirrors/mirror-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ChatGPTMirrorsPage() {
  const t = useTranslations("pages.chatgptMirrors")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "unstable">("all")
  const [freeOnly, setFreeOnly] = useState(false)

  // 过滤镜像站
  const filteredMirrors = useMemo(() => {
    return chatgptMirrors.filter((mirror) => {
      const matchesSearch =
        searchQuery === "" ||
        mirror.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mirror.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mirror.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "all" || mirror.status === statusFilter

      const matchesFree = !freeOnly || mirror.isFree

      return matchesSearch && matchesStatus && matchesFree
    })
  }, [searchQuery, statusFilter, freeOnly])

  const statusCounts = useMemo(() => {
    return {
      online: chatgptMirrors.filter((m) => m.status === "online").length,
      offline: chatgptMirrors.filter((m) => m.status === "offline").length,
      unstable: chatgptMirrors.filter((m) => m.status === "unstable").length,
    }
  }, [])

  const statusLabels = {
    online: t('statusCounts.online'),
    offline: t('statusCounts.offline'),
    unstable: t('statusCounts.unstable'),
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-10 w-10 text-orange-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
              {t('title')}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('description')}
          </p>

          {/* 状态统计 */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                {statusLabels.online}: <span className="font-semibold text-green-500">{statusCounts.online}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">
                {statusLabels.unstable}: <span className="font-semibold text-yellow-500">{statusCounts.unstable}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">
                {statusLabels.offline}: <span className="font-semibold text-red-500">{statusCounts.offline}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 过滤按钮 */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
            >
              {t('filterButtons.all')}
            </Button>
            <Button
              variant={statusFilter === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("online")}
              className={statusFilter === "online" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <CheckCircle2 className="mr-2 h-3 w-3" />
              {t('filterButtons.onlineOnly')}
            </Button>
            <Button
              variant={statusFilter === "unstable" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("unstable")}
              className={statusFilter === "unstable" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              <AlertCircle className="mr-2 h-3 w-3" />
              {t('filterButtons.unstable')}
            </Button>
            <Button
              variant={freeOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFreeOnly(!freeOnly)}
              className={freeOnly ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <Sparkles className="mr-2 h-3 w-3" />
              {t('filterButtons.freeOnly')}
            </Button>
          </div>
        </div>

        {/* 镜像站网格 */}
        {filteredMirrors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMirrors.map((mirror) => (
              <MirrorCard key={mirror.id} mirror={mirror} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t('noResultsTitle')}</h3>
            <p className="text-muted-foreground">{t('noResultsDescription')}</p>
          </div>
        )}

        {/* 统计信息 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          {t('mirrorsCount', { count: chatgptMirrors.length })}
          {searchQuery || statusFilter !== "all" || freeOnly
            ? t('showingCount', { count: filteredMirrors.length })
            : ""}
        </div>

        {/* 免责声明 */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg max-w-4xl mx-auto">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {t('usageInstructions')}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {t.raw('usageNotes').map((note: string, index: number) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
