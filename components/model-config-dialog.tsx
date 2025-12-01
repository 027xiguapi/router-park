'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, X } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

import type { AiModelConfig } from '@/lib/db/model-configs'

interface ModelConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config?: AiModelConfig | null
  onSuccess: () => void
}

export function ModelConfigDialog({ open, onOpenChange, config, onSuccess }: ModelConfigDialogProps) {
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [modelInput, setModelInput] = useState('')
  const [defaultModel, setDefaultModel] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [priority, setPriority] = useState('0')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setName(config?.name || '')
    setProvider(config?.provider || '')
    setApiUrl(config?.apiUrl || '')
    setApiKey(config?.apiKey || '')
    setModels(config?.models || [])
    setModelInput('')
    setDefaultModel(config?.defaultModel || '')
    setIsActive(config?.isActive ?? true)
    setPriority(config?.priority?.toString() || '0')
    setDescription(config?.description || '')
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, config])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  // 添加模型
  const handleAddModel = () => {
    const trimmed = modelInput.trim()
    if (trimmed && !models.includes(trimmed)) {
      setModels([...models, trimmed])
      setModelInput('')
    }
  }

  // 删除模型
  const handleRemoveModel = (model: string) => {
    setModels(models.filter((m) => m !== model))
    if (defaultModel === model) {
      setDefaultModel('')
    }
  }

  // 按 Enter 添加模型
  const handleModelInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddModel()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!name.trim() || !provider.trim() || !apiUrl.trim() || !apiKey.trim()) {
      toast({
        title: '验证失败',
        description: '名称、提供商、API URL 和 API Key 不能为空',
        variant: 'destructive'
      })
      return
    }

    // 验证 name 格式
    if (!/^[a-z0-9-]+$/.test(name.trim())) {
      toast({
        title: '验证失败',
        description: '名称只能包含小写字母、数字和连字符',
        variant: 'destructive'
      })
      return
    }

    // 验证 API URL 格式
    try {
      new URL(apiUrl.trim())
    } catch {
      toast({
        title: '验证失败',
        description: 'API URL 格式不正确',
        variant: 'destructive'
      })
      return
    }

    // 验证模型列表
    if (models.length === 0) {
      toast({
        title: '验证失败',
        description: '至少需要添加一个模型',
        variant: 'destructive'
      })
      return
    }

    // 验证优先级
    if (priority.trim() && isNaN(Number(priority))) {
      toast({
        title: '验证失败',
        description: '优先级必须是数字',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)

      const isEdit = !!config
      const endpoint = isEdit ? `/api/model-configs/${config.id}` : '/api/model-configs'
      const method = isEdit ? 'PATCH' : 'POST'

      const requestBody: Record<string, unknown> = {
        provider: provider.trim(),
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        models,
        isActive,
        priority: priority.trim() ? Number(priority) : 0
      }

      // 创建时需要 name
      if (!isEdit) {
        requestBody.name = name.trim()
      }

      // 可选字段
      if (defaultModel.trim()) requestBody.defaultModel = defaultModel.trim()
      if (description.trim()) requestBody.description = description.trim()

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
          description: isEdit ? '配置已更新' : '新配置已创建'
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{config ? '编辑配置' : '添加配置'}</DialogTitle>
            <DialogDescription>
              {config ? '更新 AI 模型 API 配置' : '创建一个新的 AI 模型 API 配置'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例如：cjack"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || !!config}
                />
                <p className="text-xs text-muted-foreground">
                  唯一标识符，只能包含小写字母、数字和连字符
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="provider">
                  提供商 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="provider"
                  placeholder="例如：CJack API"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiUrl">
                API URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apiUrl"
                type="url"
                placeholder="https://api.example.com/v1/chat/completions"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiKey">
                API Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label>
                模型列表 <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入模型名称后按 Enter 或点击添加"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  onKeyPress={handleModelInputKeyPress}
                  disabled={loading}
                />
                <Button type="button" variant="outline" onClick={handleAddModel} disabled={loading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {models.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {models.map((model) => (
                    <Badge key={model} variant="secondary" className="flex items-center gap-1">
                      {model}
                      <button
                        type="button"
                        onClick={() => handleRemoveModel(model)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                已添加 {models.length} 个模型
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="defaultModel">默认模型</Label>
                <Input
                  id="defaultModel"
                  placeholder="选填，从上方模型列表中选择"
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  disabled={loading}
                  list="model-list"
                />
                <datalist id="model-list">
                  {models.map((model) => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">优先级</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="0"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  数值越大优先级越高
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                placeholder="配置的描述信息（可选）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>启用状态</Label>
                <p className="text-xs text-muted-foreground">
                  禁用后此配置将不会被使用
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
