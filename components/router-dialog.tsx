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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

import type { Router } from '@/lib/db/routers'

interface RouterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  router?: Router | null
  onSuccess: () => void
}

export function RouterDialog({ open, onOpenChange, router, onSuccess }: RouterDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setName(router?.name || '')
    setUrl(router?.url || '')
    setInviteLink(router?.inviteLink || '')
    setIsVerified(router?.isVerified || false)
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, router])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!name.trim() || !url.trim()) {
      toast({
        title: '验证失败',
        description: '名称和 URL 不能为空',
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

      const isEdit = !!router
      const endpoint = isEdit ? `/api/routers/${router.id}` : '/api/routers'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          inviteLink: inviteLink.trim() || undefined,
          isVerified
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isEdit ? '更新成功' : '创建成功',
          description: isEdit ? '路由器信息已更新' : '新路由器已创建'
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
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{router ? '编辑路由器' : '添加路由器'}</DialogTitle>
            <DialogDescription>
              {router ? '更新路由器信息' : '创建一个新的路由器'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="例如：主路由器"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">
                URL <span className="text-destructive">*</span>
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
              <Label htmlFor="inviteLink">邀请链接（可选）</Label>
              <Input
                id="inviteLink"
                type="url"
                placeholder="https://invite.example.com"
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVerified"
                checked={isVerified}
                onCheckedChange={(checked) => setIsVerified(checked === true)}
                disabled={loading}
              />
              <Label
                htmlFor="isVerified"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                已认证路由器
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {router ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
