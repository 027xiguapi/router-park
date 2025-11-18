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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

import type { User } from '@/lib/db/users'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess: () => void
}

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [image, setImage] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setName(user?.name || '')
    setEmail(user?.email || '')
    setImage(user?.image || '')
    setEmailVerified(!!user?.emailVerified)
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, user])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!email.trim()) {
      toast.error('邮箱不能为空')
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('邮箱格式不正确')
      return
    }

    try {
      setLoading(true)

      const isEdit = !!user
      const endpoint = isEdit ? `/api/users/${user.id}` : '/api/users'
      const method = isEdit ? 'PATCH' : 'POST'

      const body: any = {
        email: email.trim(),
        name: name.trim() || undefined,
        image: image.trim() || undefined
      }

      // 只在编辑时发送 emailVerified
      if (isEdit) {
        body.emailVerified = emailVerified ? new Date() : null
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(isEdit ? '更新成功' : '创建成功')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(data.error || '操作失败，请稍后重试')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{user ? '编辑用户' : '添加用户'}</DialogTitle>
            <DialogDescription>
              {user ? '更新用户信息' : '创建一个新用户'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                邮箱 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                placeholder="张三"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">头像 URL</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                disabled={loading}
              />
            </div>

            {user && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailVerified">邮箱已验证</Label>
                  <p className="text-xs text-muted-foreground">
                    标记用户的邮箱是否已验证
                  </p>
                </div>
                <Switch
                  id="emailVerified"
                  checked={emailVerified}
                  onCheckedChange={setEmailVerified}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
