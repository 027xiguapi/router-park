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
  const { user } = useUser()

  // 临时用户ID（实际应用中应从认证系统获取）
  const TEMP_USER_ID = user?.id || ''

  const handleLike = async () => {
    if (isLiking) return

    try {
      setIsLiking(true)
      const response = await fetch(`/api/routers/${service.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: TEMP_USER_ID })
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
    <Card className="border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-accent/50 hover:shadow-md dark:border-border dark:bg-card/50 dark:backdrop-blur">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">{service.name}</h3>
          {service.isVerified && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:hover:bg-blue-500/20">
              <Shield className="mr-1 h-3 w-3" />
              {t('serviceCard.verified')}
            </Badge>
          )}
        </div>
        <Badge
          variant={isOnline ? "default" : "destructive"}
          className={
            isOnline
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20"
              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
          }
        >
          {isOnline ? t('status.online') : t('status.offline')}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <a
            href={service.inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
          >
            {service.url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {service.inviteLink && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
            asChild
          >
            <a href={service.inviteLink} target="_blank" rel="noopener noreferrer">
              {t('serviceCard.inviteLink')}
            </a>
          </Button>
        )}

        {service.error && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            {service.error}
          </Button>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm dark:border-border">
          <span className="text-gray-600 dark:text-muted-foreground">{t('serviceCard.responseTime')}</span>
          <span
            className={`font-mono font-semibold ${
              isOnline
                ? "text-emerald-600 dark:text-emerald-500"
                : "text-red-600 dark:text-red-500"
            }`}
          >
            {service.responseTime} ms
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-muted-foreground">{t('serviceCard.lastCheck')}</span>
          <span className="font-mono text-gray-900 dark:text-foreground">{service.lastCheck}</span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="gap-1 hover:text-red-500"
          >
            <Heart className={`h-4 w-4 ${likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm">{likes}</span>
          </Button>

          {/* 创建人信息 */}
          {service.createdByName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                {service.createdByImage ? (
                  <AvatarImage src={service.createdByImage} alt={service.createdByName} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-xs">{service.createdByName}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
