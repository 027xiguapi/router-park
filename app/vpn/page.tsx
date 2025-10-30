"use client"

import { useState, useMemo } from "react"
import { vpnServices, vpnFeatures } from "@/lib/vpn-data"
import { VPNCard } from "@/components/vpn/vpn-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Zap, Shield, Lock, DollarSign, AlertCircle, Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const iconMap = {
  Zap,
  Shield,
  Lock,
  DollarSign,
}

export default function VPNRecommendPage() {
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
            <Shield className="h-12 w-12 text-violet-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              VPN 推荐
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            精选优质 VPN 服务，助你安全、稳定地访问全球互联网
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>基于速度、稳定性、隐私保护等多维度评估</span>
          </div>
        </div>

        {/* 搜索和排序 */}
        <div className="max-w-4xl mx-auto mb-12 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索 VPN 服务..."
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
              className={sortBy === "default" ? "bg-gradient-to-r from-violet-600 to-purple-600" : ""}
            >
              默认排序
            </Button>
            <Button
              variant={sortBy === "rating" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("rating")}
              className={sortBy === "rating" ? "bg-gradient-to-r from-violet-600 to-purple-600" : ""}
            >
              <Star className="mr-2 h-3 w-3" />
              按评分
            </Button>
            <Button
              variant={sortBy === "price" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price")}
              className={sortBy === "price" ? "bg-gradient-to-r from-violet-600 to-purple-600" : ""}
            >
              <DollarSign className="mr-2 h-3 w-3" />
              按价格
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
                    <Icon className="h-5 w-5 text-violet-600" />
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
            <h3 className="text-xl font-semibold mb-2">未找到相关 VPN 服务</h3>
            <p className="text-muted-foreground">试试调整搜索关键词</p>
          </div>
        )}

        {/* 统计信息 */}
        <div className="mt-12 text-center text-sm text-muted-foreground mb-8">
          共推荐 {vpnServices.length} 个优质 VPN 服务
          {searchQuery ? ` · 当前显示 ${filteredAndSortedVPNs.length} 个` : ""}
        </div>

        {/* 使用建议 */}
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-2 border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                如何选择合适的 VPN？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p><strong>速度优先：</strong>如果主要用于看视频、下载，选择 ExpressVPN 或 StrongVPN</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p><strong>隐私优先：</strong>如果注重隐私保护，推荐 PrivateVPN 或 NordVPN</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p><strong>性价比优先：</strong>Just My Socks 和 Lantern 提供了优秀的性价比</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2" />
                <p><strong>中国用户：</strong>StrongVPN（支持支付宝）和 Astrill VPN（中国专线）最适合</p>
              </div>
            </CardContent>
          </Card>

          {/* 免责声明 */}
          <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                重要提示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>VPN 服务的可用性可能因地区和时间而异，建议选择提供退款保证的服务</li>
                <li>使用 VPN 时请遵守当地法律法规，仅用于合法用途</li>
                <li>部分 VPN 可能需要特殊配置才能在中国使用，购买前请咨询客服</li>
                <li>价格信息可能随时变动，以官网实际价格为准</li>
                <li>建议优先选择提供免费试用或退款保证的服务，先测试再购买</li>
                <li>不要在 VPN 连接时进行敏感操作（如网银支付），除非确认 VPN 安全可靠</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
