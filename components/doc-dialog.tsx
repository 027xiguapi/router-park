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
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import type { Doc } from '@/lib/db/docs'

interface DocDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc?: Doc | null
  onSuccess: () => void
}

export function DocDialog({ open, onOpenChange, doc, onSuccess }: DocDialogProps) {
  const [slug, setSlug] = useState('')
  const [locale, setLocale] = useState('zh-CN')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setSlug(doc?.slug || '')
    setLocale(doc?.locale || 'zh-CN')
    setCoverImageUrl(doc?.coverImageUrl || '')
    setTitle(doc?.title || '')
    setContent(doc?.content || '')
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, doc])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!slug.trim() || !locale.trim() || !title.trim() || !content.trim()) {
      toast({
        title: '验证失败',
        description: 'Slug、语言、标题和内容不能为空',
        variant: 'destructive'
      })
      return
    }

    // 验证 slug 格式（只允许字母、数字、连字符和下划线）
    const slugRegex = /^[a-z0-9-_]+$/i
    if (!slugRegex.test(slug)) {
      toast({
        title: '验证失败',
        description: 'Slug 只能包含字母、数字、连字符和下划线',
        variant: 'destructive'
      })
      return
    }

    // 如果有封面图片URL，验证格式
    if (coverImageUrl.trim()) {
      try {
        new URL(coverImageUrl)
      } catch {
        toast({
          title: '验证失败',
          description: '封面图片 URL 格式不正确',
          variant: 'destructive'
        })
        return
      }
    }

    try {
      setLoading(true)

      const isEdit = !!doc
      const endpoint = isEdit ? `/api/docs/${doc.id}` : '/api/docs'
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slug: slug.trim(),
          locale: locale.trim(),
          coverImageUrl: coverImageUrl.trim() || undefined,
          title: title.trim(),
          content: content.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isEdit ? '更新成功' : '创建成功',
          description: isEdit ? '文档信息已更新' : '新文档已创建'
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
            <DialogTitle>{doc ? '编辑文档' : '添加文档'}</DialogTitle>
            <DialogDescription>
              {doc ? '更新文档信息' : '创建一个新的文档'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="例如：getting-started"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                URL 友好的标识符，只能包含字母、数字、连字符和下划线
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="locale">
                语言 <span className="text-destructive">*</span>
              </Label>
              <Select value={locale} onValueChange={setLocale} disabled={loading}>
                <SelectTrigger id="locale">
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文 (zh-CN)</SelectItem>
                  <SelectItem value="en">English (en)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">
                标题 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="例如：快速入门指南"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coverImageUrl">封面图片 URL（可选）</Label>
              <Input
                id="coverImageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">
                内容 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="支持 Markdown 格式..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                支持 Markdown 格式
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {doc ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
