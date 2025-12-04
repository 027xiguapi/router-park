'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Users, DollarSign, Gift, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

interface InviteStats {
  inviteCode: string
  inviteCount: number
  totalEarned: number
  balance: number
  invitees: Array<{
    id: string
    inviteeId: string
    reward: number
    createdAt: Date
  }>
}

export function InviteManager({ userId }: { userId: string }) {
  const [stats, setStats] = useState<InviteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState('')
  const [applying, setApplying] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInviteStats()
  }, [userId])

  const fetchInviteStats = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/invite-stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch invite stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = () => {
    if (!stats?.inviteCode) return
    
    const inviteLink = `${window.location.origin}/login?aff=${stats.inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    toast({
      title: '已复制',
      description: '邀请链接已复制到剪贴板'
    })
  }

  const copyInviteCode = () => {
    if (!stats?.inviteCode) return
    
    navigator.clipboard.writeText(stats.inviteCode)
    toast({
      title: '已复制',
      description: '邀请码已复制到剪贴板'
    })
  }

  const applyInviteCode = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: '错误',
        description: '请输入邀请码',
        variant: 'destructive'
      })
      return
    }

    setApplying(true)
    try {
      const response = await fetch('/api/invite/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: '成功',
          description: '邀请码已应用，邀请人将获得奖励！'
        })
        setInviteCode('')
        fetchInviteStats()
      } else {
        toast({
          title: '失败',
          description: data.error || '无效的邀请码',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '应用邀请码失败，请重试',
        variant: 'destructive'
      })
    } finally {
      setApplying(false)
    }
  }

  const formatBalance = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 余额和统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>当前余额</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{formatBalance(stats?.balance || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>邀请人数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats?.inviteCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>累计奖励</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">{formatBalance(stats?.totalEarned || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 邀请链接 */}
      <Card>
        <CardHeader>
          <CardTitle>我的邀请链接</CardTitle>
          <CardDescription>
            分享您的邀请链接，每成功邀请一位好友注册，您将获得 $20 奖励
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={stats?.inviteCode ? `${window.location.origin}/login?aff=${stats.inviteCode}` : ''}
              className="font-mono text-sm"
            />
            <Button onClick={copyInviteLink} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              复制链接
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">邀请码：</span>
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {stats?.inviteCode || '加载中...'}
            </code>
            <Button onClick={copyInviteCode} variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              邀请奖励规则
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 新用户注册即送 $100 余额</li>
              <li>• 通过您的邀请链接注册，您将获得 $20 奖励</li>
              <li>• 奖励将自动发放到您的账户余额</li>
              <li>• 余额可用于购买 API 额度等服务</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 邀请记录 */}
      {stats && stats.invitees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>邀请记录</CardTitle>
            <CardDescription>您已成功邀请 {stats.invitees.length} 位好友</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.invitees.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">新用户注册</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invite.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    +{formatBalance(invite.reward)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
