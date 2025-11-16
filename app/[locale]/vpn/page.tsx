"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { vpnServices, freeVPNServices, vpnFeatures } from "@/lib/vpn-data"
import { VPNCard } from "@/components/vpn/vpn-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Zap, Shield, Lock, DollarSign, AlertCircle, Star, TrendingUp, Gift } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {FreeVPN} from "@/components/free-vpn";

const iconMap = {
  Zap,
  Shield,
  Lock,
  DollarSign,
}

export default function VPNRecommendPage() {
  const t = useTranslations("pages.vpn")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rating" | "price" | "default">("default")

  // 过滤和排序 VPN
  const filteredAndSortedVPNs = useMemo(() => {
    let result = vpnServices.filter((vpn) => {
      const matchesSearch =
        searchQuery === "" ||
        vpn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vpn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vpn.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSearch
    })

    // 排序
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "price") {
      // 简单的价格排序（基于字符串，实际应该解析价格）
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0
        return priceA - priceB
      })
    }

    return result
  }, [searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-orange-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
              {t('title')}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            {t('description')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{t('evaluationBasis')}</span>
          </div>
        </div>

        {/* 搜索和排序 */}
        <div className="max-w-4xl mx-auto mb-12 space-y-4">
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

          {/* 排序按钮 */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={sortBy === "default" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("default")}
              className={sortBy === "default" ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
            >
              {t('sortButtons.default')}
            </Button>
            <Button
              variant={sortBy === "rating" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("rating")}
              className={sortBy === "rating" ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
            >
              <Star className="mr-2 h-3 w-3" />
              {t('sortButtons.byRating')}
            </Button>
            <Button
              variant={sortBy === "price" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price")}
              className={sortBy === "price" ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
            >
              <DollarSign className="mr-2 h-3 w-3" />
              {t('sortButtons.byPrice')}
            </Button>
          </div>
        </div>

        {/* 选择要点 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {vpnFeatures.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap]
            return (
              <Card key={index} className="border-2 hover:border-violet-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-orange-600" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* VPN 列表 */}
        {filteredAndSortedVPNs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAndSortedVPNs.map((vpn, index) => (
              <VPNCard
                key={vpn.id}
                vpn={vpn}
                rank={sortBy === "default" ? index + 1 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t('noResultsTitle')}</h3>
            <p className="text-muted-foreground">{t('noResultsDescription')}</p>
          </div>
        )}

        {/* 免费VPN专区 */}
        <div className="mt-16 mb-12">
          <div className="mb-12">
            <FreeVPN />
          </div>

          {/* 免费VPN使用提示 */}
          <Card className="border-2 border-green-500/20 bg-green-500/5 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-green-600" />
                免费VPN使用提示
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2" />
                <p><strong>流量限制：</strong>大部分免费VPN都有流量限制，适合轻度使用或临时需求</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2" />
                <p><strong>速度较慢：</strong>免费VPN通常速度较慢，不适合看视频或下载大文件</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2" />
                <p><strong>隐私风险：</strong>选择知名品牌的免费VPN，避免使用来路不明的服务</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2" />
                <p><strong>升级选项：</strong>如果需要更好的体验，建议考虑付费版本或上方的付费VPN服务</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 统计信息 */}
        <div className="mt-12 text-center text-sm text-muted-foreground mb-8">
          {t('stats.totalRecommended', { count: vpnServices.length })}
          {searchQuery ? t('stats.currentlyShowing', { count: filteredAndSortedVPNs.length }) : ""}
        </div>

        {/* 使用建议 */}
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-2 border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                {t('selectionGuide.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p>{t('selectionGuide.speedPriority')}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p>{t('selectionGuide.privacyPriority')}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p>{t('selectionGuide.valuePriority')}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p>{t('selectionGuide.chinaUsers')}</p>
              </div>
            </CardContent>
          </Card>

          {/* 免责声明 */}
          <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                {t('disclaimer.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                {t.raw('disclaimer.items').map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
