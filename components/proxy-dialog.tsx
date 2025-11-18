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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import type { Proxy } from '@/lib/db/proxys'

interface ProxyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proxy?: Proxy | null
  onSuccess: () => void
}

export function ProxyDialog({ open, onOpenChange, proxy, onSuccess }: ProxyDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [content, setContent] = useState('')
  const [models, setModels] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [sortOrder, setSortOrder] = useState('0')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setName(proxy?.name || '')
    setUrl(proxy?.url || '')
    setSlug(proxy?.slug || '')
    setSeoTitle(proxy?.seoTitle || '')
    setSeoDescription(proxy?.seoDescription || '')
    setContent(proxy?.content || '')
    setModels(proxy?.models || '')
    setInviteLink(proxy?.inviteLink || '')
    setStatus(proxy?.status || 'active')
    setSortOrder(proxy?.sortOrder?.toString() || '0')
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, proxy])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!name.trim() || !url.trim() || !slug.trim() || !seoTitle.trim() || !seoDescription.trim()) {
      toast({
        title: '验证失败',
        description: '名称、URL、Slug、SEO 标题和 SEO 描述不能为空',
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

    // 验证 slug 格式
    if (!/^[a-z0-9-]+$/.test(slug)) {
      toast({
        title: '验证失败',
        description: 'Slug 只能包含小写字母、数字和连字符',
        variant: 'destructive'
      })
      return
    }

    // 验证邀请链接（如果提供）
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

      const isEdit = !!proxy
      const endpoint = isEdit ? `/api/proxys/${proxy.id}` : '/api/proxys'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          slug: slug.trim(),
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          content: content.trim() || undefined,
          models: models.trim() || undefined,
          inviteLink: inviteLink.trim() || undefined,
          status,
          sortOrder: parseInt(sortOrder, 10)
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isEdit ? '更新成功' : '创建成功',
          description: isEdit ? 'Proxy 信息已更新' : '新 Proxy 已创建'
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{proxy ? '编辑 Proxy' : '添加 Proxy'}</DialogTitle>
            <DialogDescription>
              {proxy ? '更新 Proxy 信息' : '创建一个新的 Proxy'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="例如：MegaLLM AI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="例如：megallm （只能小写字母、数字和连字符）"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                用于 URL 路径：/proxy/{slug || 'your-slug'}
              </p>
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
              <Label htmlFor="seoTitle">
                SEO 标题 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="seoTitle"
                placeholder="页面标题，用于 SEO"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seoDescription">
                SEO 描述 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="seoDescription"
                placeholder="页面描述，用于 SEO"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">
                Markdown 内容（可选）
              </Label>
              <Textarea
                id="content"
                placeholder="支持 Markdown 语法的页面内容..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                支持 Markdown 语法，会在 Proxy 详情页渲染
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="models">
                支持的模型（可选）
              </Label>
              <Input
                id="models"
                placeholder='例如：["GPT-4", "Claude", "Gemini"]'
                value={models}
                onChange={(e) => setModels(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                JSON 数组格式的模型列表
              </p>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">状态</Label>
                <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)} disabled={loading}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sortOrder">排序顺序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">数字越大排序越靠前</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {proxy ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
