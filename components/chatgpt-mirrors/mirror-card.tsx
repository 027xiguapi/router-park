"use client"

import { ChatGPTMirror } from "@/lib/chatgpt-mirrors-data"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle2, XCircle, AlertCircle, Lock, Sparkles } from "lucide-react"
import { Link } from '@/i18n/navigation'

interface MirrorCardProps {
  mirror: ChatGPTMirror
}

export function MirrorCard({ mirror }: MirrorCardProps) {
  const statusConfig = {
    online: {
      icon: CheckCircle2,
      text: "在线",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    offline: {
      icon: XCircle,
      text: "离线",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    unstable: {
      icon: AlertCircle,
      text: "不稳定",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  }

  const StatusIcon = statusConfig[mirror.status].icon

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] h-full flex flex-col">
      <CardHeader className="space-y-3">
        {/* 标题和状态 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{mirror.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 text-xs ${statusConfig[mirror.status].color}`}>
                <StatusIcon className="h-3 w-3" />
                <span>{statusConfig[mirror.status].text}</span>
              </div>
            </div>
          </div>
          <Link
            href={mirror.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              访问
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {mirror.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        {/* 特性列表 */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">特性</h4>
          <div className="grid grid-cols-2 gap-2">
            {mirror.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <Sparkles className="h-3 w-3 text-violet-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          {mirror.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {mirror.isFree && (
            <Badge className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20">
              免费
            </Badge>
          )}
          {mirror.requiresLogin && (
            <Badge variant="outline" className="text-xs">
              <Lock className="mr-1 h-2 w-2" />
              需登录
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3">
        {/* URL 显示 */}
        <div className="w-full">
          <Link
            href={mirror.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate block"
          >
            {mirror.url}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
