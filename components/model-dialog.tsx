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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { Model } from '@/lib/db/models'

interface ModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model?: Model | null
  onSuccess: () => void
}

export function ModelDialog({ open, onOpenChange, model, onSuccess }: ModelDialogProps) {
  const [slug, setSlug] = useState('')
  const [locale, setLocale] = useState('zh-CN')
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('openai')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('active')
  const [contextWindow, setContextWindow] = useState('')
  const [maxOutputTokens, setMaxOutputTokens] = useState('')
  const [officialUrl, setOfficialUrl] = useState('')
  const [apiDocUrl, setApiDocUrl] = useState('')
  const [pricing, setPricing] = useState('')
  const [capabilities, setCapabilities] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setSlug(model?.slug || '')
    setLocale(model?.locale || 'zh-CN')
    setName(model?.name || '')
    setProvider(model?.provider || 'openai')
    setCoverImageUrl(model?.coverImageUrl || '')
    setTitle(model?.title || '')
    setDescription(model?.description || '')
    setContent(model?.content || '')
    setStatus(model?.status || 'active')
    setContextWindow(model?.contextWindow?.toString() || '')
    setMaxOutputTokens(model?.maxOutputTokens?.toString() || '')
    setOfficialUrl(model?.officialUrl || '')
    setApiDocUrl(model?.apiDocUrl || '')
    setPricing(model?.pricing || '')
    setCapabilities(model?.capabilities || '')
    setSortOrder(model?.sortOrder?.toString() || '0')
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, model])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!slug.trim() || !locale.trim() || !name.trim() || !provider.trim() || !title.trim() || !content.trim()) {
      toast({
        title: '验证失败',
        description: 'Slug、语言、模型名称、提供商、标题和内容不能为空',
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

    // 验证 URL 格式
    const urlFields = [
      { value: coverImageUrl, name: '封面图片 URL' },
      { value: officialUrl, name: '官方网站 URL' },
      { value: apiDocUrl, name: 'API 文档 URL' }
    ]

    for (const field of urlFields) {
      if (field.value.trim()) {
        try {
          new URL(field.value)
        } catch {
          toast({
            title: '验证失败',
            description: `${field.name} 格式不正确`,
            variant: 'destructive'
          })
          return
        }
      }
    }

    // 验证数字字段
    if (contextWindow.trim() && isNaN(Number(contextWindow))) {
      toast({
        title: '验证失败',
        description: '上下文窗口必须是数字',
        variant: 'destructive'
      })
      return
    }

    if (maxOutputTokens.trim() && isNaN(Number(maxOutputTokens))) {
      toast({
        title: '验证失败',
        description: '最大输出 tokens 必须是数字',
        variant: 'destructive'
      })
      return
    }

    if (sortOrder.trim() && isNaN(Number(sortOrder))) {
      toast({
        title: '验证失败',
        description: '排序顺序必须是数字',
        variant: 'destructive'
      })
      return
    }

    // 验证 capabilities JSON 格式
    if (capabilities.trim()) {
      try {
        JSON.parse(capabilities)
      } catch {
        toast({
          title: '验证失败',
          description: '能力标签必须是有效的 JSON 数组格式，例如: ["text", "vision"]',
          variant: 'destructive'
        })
        return
      }
    }

    try {
      setLoading(true)

      const isEdit = !!model
      const endpoint = isEdit ? `/api/models/${model.id}` : '/api/models'
      const method = isEdit ? 'PATCH' : 'POST'

      const requestBody: any = {
        slug: slug.trim(),
        locale: locale.trim(),
        name: name.trim(),
        provider: provider.trim(),
        title: title.trim(),
        content: content.trim(),
        status: status.trim(),
        sortOrder: sortOrder.trim() ? Number(sortOrder) : 0
      }

      // 添加可选字段
      if (coverImageUrl.trim()) requestBody.coverImageUrl = coverImageUrl.trim()
      if (description.trim()) requestBody.description = description.trim()
      if (contextWindow.trim()) requestBody.contextWindow = Number(contextWindow)
      if (maxOutputTokens.trim()) requestBody.maxOutputTokens = Number(maxOutputTokens)
      if (officialUrl.trim()) requestBody.officialUrl = officialUrl.trim()
      if (apiDocUrl.trim()) requestBody.apiDocUrl = apiDocUrl.trim()
      if (pricing.trim()) requestBody.pricing = pricing.trim()
      if (capabilities.trim()) requestBody.capabilities = capabilities.trim()

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isEdit ? '更新成功' : '创建成功',
          description: isEdit ? '模型信息已更新' : '新模型已创建'
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{model ? '编辑模型' : '添加模型'}</DialogTitle>
            <DialogDescription>
              {model ? '更新大语言模型信息' : '创建一个新的大语言模型'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="specs">规格参数</TabsTrigger>
              <TabsTrigger value="links">链接信息</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="slug">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="slug"
                    placeholder="例如：gpt-4"
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
                  <Label htmlFor="name">
                    模型名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="例如：GPT-4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="provider">
                    提供商 <span className="text-destructive">*</span>
                  </Label>
                  <Select value={provider} onValueChange={setProvider} disabled={loading}>
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="选择提供商" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="meta">Meta</SelectItem>
                      <SelectItem value="mistral">Mistral</SelectItem>
                      <SelectItem value="alibaba">阿里巴巴</SelectItem>
                      <SelectItem value="baidu">百度</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">状态</Label>
                  <Select value={status} onValueChange={setStatus} disabled={loading}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">排序顺序</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    placeholder="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">
                  SEO 标题 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="例如：GPT-4 - OpenAI 最先进的语言模型"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">简短描述（可选）</Label>
                <Textarea
                  id="description"
                  placeholder="模型的简短描述..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">
                  详细内容 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="支持 Markdown 格式的详细介绍..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  支持 Markdown 格式
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contextWindow">上下文窗口（tokens）</Label>
                  <Input
                    id="contextWindow"
                    type="number"
                    placeholder="例如：128000"
                    value={contextWindow}
                    onChange={(e) => setContextWindow(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxOutputTokens">最大输出 tokens</Label>
                  <Input
                    id="maxOutputTokens"
                    type="number"
                    placeholder="例如：4096"
                    value={maxOutputTokens}
                    onChange={(e) => setMaxOutputTokens(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="capabilities">能力标签（JSON 数组）</Label>
                <Input
                  id="capabilities"
                  placeholder='例如：["text", "vision", "function-calling"]'
                  value={capabilities}
                  onChange={(e) => setCapabilities(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  必须是有效的 JSON 数组格式
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pricing">定价信息（Markdown）</Label>
                <Textarea
                  id="pricing"
                  placeholder="支持 Markdown 格式的定价信息..."
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  disabled={loading}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
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
                <Label htmlFor="officialUrl">官方网站 URL（可选）</Label>
                <Input
                  id="officialUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={officialUrl}
                  onChange={(e) => setOfficialUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apiDocUrl">API 文档 URL（可选）</Label>
                <Input
                  id="apiDocUrl"
                  type="url"
                  placeholder="https://example.com/docs"
                  value={apiDocUrl}
                  onChange={(e) => setApiDocUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {model ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
