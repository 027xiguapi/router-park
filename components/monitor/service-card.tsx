"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Heart, Shield, User } from "lucide-react"
import type { ServiceStatus } from "./types"
import {useUser} from "@/contexts/user-context";

interface ServiceCardProps {
  service: ServiceStatus
  t: (key: string) => string
}

export function ServiceCard({ service, t }: ServiceCardProps) {
  const isOnline = service.status === "online"
  const [likes, setLikes] = useState(service.likes || 0)
  const [isLiking, setIsLiking] = useState(false)
  const { isAuthenticated, showLoginModal, user } = useUser()

  const handleLike = async () => {
    if (isLiking) return

    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    try {
      setIsLiking(true)
      const response = await fetch(`/api/routers/${service.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.id || '' })
      })

      const data = await response.json()
      if (data.success) {
        setLikes(data.data.likes)
      }
    } catch (error) {
      console.error('Error liking router:', error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Card className="border-gray-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:border-accent/50 hover:shadow-md dark:border-border dark:bg-card/50 dark:backdrop-blur">
      {/* 头部区域 */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-foreground break-all">{service.name}</h3>
          {service.isVerified && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:hover:bg-blue-500/20 text-xs shrink-0">
              <Shield className="mr-1 h-3 w-3" />
              {t('serviceCard.verified')}
            </Badge>
          )}
        </div>
        <Badge
          variant={isOnline ? "default" : "destructive"}
          className={`shrink-0 text-xs ${
            isOnline
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20"
              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
          }`}
        >
          {isOnline ? t('status.online') : t('status.offline')}
        </Badge>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {/* URL 链接 */}
        <div className="flex items-center text-xs sm:text-sm">
          <a
            href={service.inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300 break-all"
          >
            <span className="line-clamp-1">{service.url}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>

        {/* 邀请链接按钮 */}
        {service.inviteLink && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 text-xs sm:text-sm h-8 sm:h-9"
            asChild
          >
            <a href={service.inviteLink} target="_blank" rel="noopener noreferrer">
              {t('serviceCard.inviteLink')}
            </a>
          </Button>
        )}

        {/* 错误信息 */}
        {service.error && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 text-xs sm:text-sm h-auto min-h-[2rem] sm:min-h-[2.25rem] whitespace-normal"
          >
            {service.error}
          </Button>
        )}

        {/* 响应时间 */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2.5 sm:pt-3 text-xs sm:text-sm dark:border-border">
          <span className="text-gray-600 dark:text-muted-foreground">{t('serviceCard.responseTime')}</span>
          <span
            className={`font-mono font-semibold text-xs sm:text-sm ${
              isOnline
                ? "text-emerald-600 dark:text-emerald-500"
                : "text-red-600 dark:text-red-500"
            }`}
          >
            {service.responseTime} ms
          </span>
        </div>

        {/* 最后检查时间 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-muted-foreground">{t('serviceCard.lastCheck')}</span>
          <span className="font-mono text-gray-900 dark:text-foreground text-xs">{service.lastCheck}</span>
        </div>

        {/* 底部操作区 */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2.5 sm:pt-3 dark:border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="gap-1 hover:text-red-500 h-8 px-2 sm:px-3"
          >
            <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-xs sm:text-sm">{likes}</span>
          </Button>

          {/* 创建人信息 */}
          {service.createdByName && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                {service.createdByImage ? (
                  <AvatarImage src={service.createdByImage} alt={service.createdByName} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-xs truncate max-w-[100px] sm:max-w-none">{service.createdByName}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
