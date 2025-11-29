'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  XCircle,
  Shield,
  ExternalLink,
  Clock,
  ThumbsUp,
  Loader2
} from 'lucide-react'

interface Router {
  id: string
  name: string
  url: string
  status: 'online' | 'offline'
  responseTime: number
  lastCheck: Date
  inviteLink: string | null
  isVerified: boolean
  likes: number
  createdBy: string | null
  createdByName: string | null
  createdByImage: string | null
  updatedBy: string | null
  createdAt: Date
  updatedAt: Date
  isLikedByCurrentUser?: boolean
}

interface UserRoutersProps {
  userId: string
  type: 'created' | 'liked'
}

export function UserRouters({ userId, type }: UserRoutersProps) {
  const [routers, setRouters] = useState<Router[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRouters() {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          userId,
          pageSize: '100'
        })

        if (type === 'liked') {
          params.append('likedBy', 'true')
        } else {
          params.append('createdBy', 'true')
        }

        const response = await fetch(`/api/routers?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setRouters(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching routers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRouters()
  }, [userId, type])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (routers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {type === 'created' ? '暂无提交的 Router' : '暂无点赞的 Router'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {routers.map((router, index) => (
        <Card
          key={router.id}
          className="p-4 hover:shadow-md transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                <h3 className="font-bold text-lg">{router.name}</h3>
                {router.status === 'online' ? (
                  <Badge
                    variant="default"
                    className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    在线
                  </Badge>
                ) : (
                  <Badge
                    variant="destructive"
                    className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    离线
                  </Badge>
                )}
                {router.isVerified && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    已验证
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {router.responseTime}ms
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {router.likes}
                </div>
              </div>
              <a
                href={router.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
              >
                {router.url}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
            {router.inviteLink && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={router.inviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  访问链接
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
