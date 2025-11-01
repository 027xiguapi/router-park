"use client"

import { VPN } from "@/lib/vpn-data"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star, Zap, Shield, TrendingUp, CreditCard } from "lucide-react"
import { Link } from '@/i18n/navigation'

interface VPNCardProps {
  vpn: VPN
  rank?: number
}

export function VPNCard({ vpn, rank }: VPNCardProps) {
  const speedIcons = {
    excellent: <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
    fast: <Zap className="h-4 w-4 text-green-500" />,
    medium: <Zap className="h-4 w-4 text-blue-500" />,
  }

  const stabilityIcons = {
    excellent: <Shield className="h-4 w-4 text-green-500 fill-green-500" />,
    high: <Shield className="h-4 w-4 text-green-500" />,
    medium: <Shield className="h-4 w-4 text-blue-500" />,
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] h-full flex flex-col border-2 hover:border-orange-500/50">
      {/* 排名角标 */}
      {rank && rank <= 3 && (
        <div className="absolute top-0 right-0 z-10">
          <div className={`
            px-3 py-1 text-xs font-bold text-white rounded-bl-lg
            ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : ''}
            ${rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : ''}
            ${rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : ''}
          `}>
            TOP {rank}
          </div>
        </div>
      )}

      <CardHeader className="space-y-3">
        {/* 标题和评分 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {vpn.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-sm">{vpn.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {speedIcons[vpn.speed]}
                <span>速度</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stabilityIcons[vpn.stability]}
                <span>稳定</span>
              </div>
            </div>
          </div>
        </div>

        {/* 价格 */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-orange-600">{vpn.price}</span>
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {vpn.description}
        </p>

        {/* 亮点 */}
        {vpn.highlights && vpn.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vpn.highlights.map((highlight, index) => (
              <Badge key={index} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                {highlight}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* 特性列表 */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">核心特性</h4>
          <div className="grid grid-cols-1 gap-2">
            {vpn.features.slice(0, 6).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 支付方式 */}
        {vpn.paymentMethods && vpn.paymentMethods.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              支付方式
            </h4>
            <div className="flex flex-wrap gap-2">
              {vpn.paymentMethods.map((method, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          {vpn.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 pb-4">
        <Link
          href={vpn.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-semibold"
          >
            立即访问
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
