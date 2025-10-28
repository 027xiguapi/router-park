"use client"

import { AITool } from "@/lib/ai-tools-data"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, TrendingUp, Users, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ToolCardProps {
  tool: AITool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
      {/* 工具截图 */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={tool.image}
          alt={tool.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            // 图片加载失败时显示占位符
            e.currentTarget.src = "/placeholder-tool.png"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* 查看详情按钮 */}
        <Link
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Button
            size="sm"
            className="bg-white/90 text-black hover:bg-white backdrop-blur-sm"
          >
            查看详情
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </div>

      <CardHeader className="space-y-2 pb-3">
        {/* 标题和外链图标 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{tool.name}</h3>
          <Link
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {tool.description}
        </p>
      </CardHeader>

      <CardContent className="pb-3">
        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-3 pb-3">
        {/* 统计信息 */}
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {/* 国家 */}
            <div className="flex items-center gap-1">
              <span className="text-base">{tool.stats.countryFlag}</span>
              <span>{tool.stats.percentage}</span>
            </div>

            {/* 流量 */}
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{tool.stats.traffic}</span>
            </div>
          </div>

          {/* 点赞数 */}
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{tool.stats.likes}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
