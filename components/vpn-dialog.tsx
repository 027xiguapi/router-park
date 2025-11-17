'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

import type { VPN } from '@/lib/db/vpns'

interface VpnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vpn?: VPN | null
  onSuccess: () => void
}

export function VpnDialog({ open, onOpenChange, vpn, onSuccess }: VpnDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [subscriptionUrl, setSubscriptionUrl] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setName(vpn?.name || '')
    setUrl(vpn?.url || '')
    setSubscriptionUrl(vpn?.subscriptionUrl || '')
    setInviteLink(vpn?.inviteLink || '')
    setDescription(vpn?.description || '')
    setIsActive(vpn?.isActive ?? true)
    setSortOrder(vpn?.sortOrder || 0)
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, vpn])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!name.trim() || !url.trim() || !subscriptionUrl.trim()) {
      toast({
        title: '验证失败',
        description: '名称、URL 和订阅链接不能为空',
        variant: 'destructive'
      })
      return
    }

    // 验证 URL 格式
    try {
      new URL(url)
    } catch {
      toast({
        title: '验证失败',
        description: 'URL 格式不正确',
        variant: 'destructive'
      })
      return
    }

    // 验证订阅链接格式
    try {
      new URL(subscriptionUrl)
    } catch {
      toast({
        title: '验证失败',
        description: '订阅链接格式不正确',
        variant: 'destructive'
      })
      return
    }

    // 如果有邀请链接，验证格式
    if (inviteLink.trim()) {
      try {
        new URL(inviteLink)
      } catch {
        toast({
          title: '验证失败',
          description: '邀请链接格式不正确',
          variant: 'destructive'
        })
        return
      }
    }

    try {
      setLoading(true)

      const isEdit = !!vpn
      const endpoint = isEdit ? `/api/vpns/${vpn.id}` : '/api/vpns'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          subscriptionUrl: subscriptionUrl.trim(),
          inviteLink: inviteLink.trim() || undefined,
          description: description.trim() || undefined,
          isActive,
          sortOrder: Number(sortOrder)
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isEdit ? '更新成功' : '创建成功',
          description: isEdit ? 'VPN信息已更新' : '新VPN已创建'
        })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: isEdit ? '更新失败' : '创建失败',
          description: data.error || '操作失败，请稍后重试',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{vpn ? '编辑VPN' : '添加VPN'}</DialogTitle>
            <DialogDescription>
              {vpn ? '更新VPN配置信息' : '创建一个新的VPN配置'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="例如：ExpressVPN"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">
                官方网站 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subscriptionUrl">
                订阅链接 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subscriptionUrl"
                type="url"
                placeholder="https://api.example.com/v1/subscription"
                value={subscriptionUrl}
                onChange={(e) => setSubscriptionUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inviteLink">邀请链接（可选）</Label>
              <Input
                id="inviteLink"
                type="url"
                placeholder="https://invite.example.com/ref/xxx"
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                placeholder="VPN服务描述，例如特色功能、服务器分布等..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">排序序号</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  placeholder="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  disabled={loading}
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2 mt-8">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                  disabled={loading}
                />
                <Label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  激活状态
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vpn ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}