'use client'

import { useState } from 'react'
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
import { toast } from 'sonner'

import { addProxy } from '@/actions/proxy'

interface AddProxyUrlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddProxyUrlDialog({ open, onOpenChange, onSuccess }: AddProxyUrlDialogProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setUrl('')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!url.trim()) {
      toast.error('URL 不能为空')
      return
    }

    // 验证 URL 格式
    try {
      new URL(url)
    } catch {
      toast.error('URL 格式不正确')
      return
    }

    try {
      setLoading(true)

      const result = await addProxy(url.trim())

      if (result) {
        toast.success('Proxy 添加成功')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error('未找到匹配的路由，请检查 URL 是否正确')
      }
    } catch (error) {
      toast.error('添加失败，请稍后重试')
      console.error('Add proxy error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加 Proxy</DialogTitle>
            <DialogDescription>
              输入邀请链接 URL，系统将从路由表中查找并创建对应的 Proxy
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">
                邀请链接 URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/invite"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                请输入完整的邀请链接 URL，系统将自动匹配路由表中的记录
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              添加
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
