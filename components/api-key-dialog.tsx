'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, X, RefreshCw } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { ApiKey } from '@/lib/db/api-keys'
import type { ApiKeyStatus } from '@/lib/db/schema'

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey?: ApiKey | null
  onSuccess: () => void
}

// 生成随机 Key
function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk-'
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function ApiKeyDialog({ open, onOpenChange, apiKey, onSuccess }: ApiKeyDialogProps) {
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [status, setStatus] = useState<ApiKeyStatus>('active')
  const [expiresAt, setExpiresAt] = useState('')
  const [quota, setQuota] = useState('0')
  const [unlimitedQuota, setUnlimitedQuota] = useState(false)
  const [allowedModels, setAllowedModels] = useState<string[]>([])
  const [modelInput, setModelInput] = useState('')
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([])
  const [ipInput, setIpInput] = useState('')
  const [rateLimit, setRateLimit] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setKey(apiKey?.key || generateKey())
    setName(apiKey?.name || '')
    setGroup(apiKey?.group || '')
    setStatus(apiKey?.status || 'active')
    setExpiresAt(apiKey?.expiresAt ? new Date(apiKey.expiresAt).toISOString().slice(0, 16) : '')
    setQuota(apiKey?.quota?.toString() || '0')
    setUnlimitedQuota(apiKey?.unlimitedQuota || false)
    setAllowedModels(apiKey?.allowedModels || [])
    setModelInput('')
    setIpWhitelist(apiKey?.ipWhitelist || [])
    setIpInput('')
    setRateLimit(apiKey?.rateLimit?.toString() || '')
    setIsPublic(apiKey?.isPublic || false)
    setDescription(apiKey?.description || '')
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, apiKey])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  // 重新生成 Key
  const handleRegenerateKey = () => {
    setKey(generateKey())
  }

  // 添加模型
  const handleAddModel = () => {
    const trimmed = modelInput.trim()
    if (trimmed && !allowedModels.includes(trimmed)) {
      setAllowedModels([...allowedModels, trimmed])
      setModelInput('')
    }
  }

  // 删除模型
  const handleRemoveModel = (model: string) => {
    setAllowedModels(allowedModels.filter((m) => m !== model))
  }

  // 添加 IP
  const handleAddIp = () => {
    const trimmed = ipInput.trim()
    if (trimmed && !ipWhitelist.includes(trimmed)) {
      setIpWhitelist([...ipWhitelist, trimmed])
      setIpInput('')
    }
  }

  // 删除 IP
  const handleRemoveIp = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter((i) => i !== ip))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!name.trim()) {
      toast({
        title: '验证失败',
        description: '名称不能为空',
        variant: 'destructive'
      })
      return
    }

    if (!key.trim() || !key.startsWith('sk-')) {
      toast({
        title: '验证失败',
        description: '密钥必须以 "sk-" 开头',
        variant: 'destructive'
      })
      return
    }

    if (quota && isNaN(Number(quota))) {
      toast({
        title: '验证失败',
        description: '额度必须是数字',
        variant: 'destructive'
      })
      return
    }

    if (rateLimit && isNaN(Number(rateLimit))) {
      toast({
        title: '验证失败',
        description: '速率限制必须是数字',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)

      const isEdit = !!apiKey
      const endpoint = isEdit ? `/api/api-keys/${apiKey.id}` : '/api/api-keys'
      const method = isEdit ? 'PATCH' : 'POST'

      const requestBody: Record<string, unknown> = {
        name: name.trim(),
        group: group.trim() || null,
        status,
        quota: quota ? Number(quota) : 0,
        unlimitedQuota,
        allowedModels: allowedModels.length > 0 ? allowedModels : null,
        ipWhitelist: ipWhitelist.length > 0 ? ipWhitelist : null,
        rateLimit: rateLimit ? Number(rateLimit) : null,
        isPublic,
        description: description.trim() || null
      }

      // 创建时需要 key
      if (!isEdit) {
        requestBody.key = key.trim()
      }

      // 过期时间
      if (expiresAt) {
        requestBody.expiresAt = new Date(expiresAt).toISOString()
      } else {
        requestBody.expiresAt = null
      }

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
          description: isEdit ? '密钥已更新' : '新密钥已创建'
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
            <DialogTitle>{apiKey ? '编辑密钥' : '添加密钥'}</DialogTitle>
            <DialogDescription>
              {apiKey ? '更新 API 密钥配置' : '创建一个新的 API 密钥'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="limits">限制设置</TabsTrigger>
              <TabsTrigger value="access">访问控制</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="key">
                  API 密钥 {!apiKey && <span className="text-destructive">*</span>}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="key"
                    placeholder="sk-..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    disabled={loading || !!apiKey}
                    className="font-mono"
                  />
                  {!apiKey && (
                    <Button type="button" variant="outline" onClick={handleRegenerateKey} disabled={loading}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  必须以 "sk-" 开头，创建后不可修改
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="例如：我的开发密钥"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="group">令牌分组</Label>
                  <Input
                    id="group"
                    placeholder="例如：default"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">状态</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ApiKeyStatus)} disabled={loading}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active（激活）</SelectItem>
                      <SelectItem value="inactive">Inactive（停用）</SelectItem>
                      <SelectItem value="expired">Expired（已过期）</SelectItem>
                      <SelectItem value="exhausted">Exhausted（已用尽）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expiresAt">过期时间</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    留空表示永不过期
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="密钥用途描述..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div className="space-y-0.5">
                  <Label>公开密钥</Label>
                  <p className="text-xs text-muted-foreground">
                    启用后将在首页展示给用户免费使用
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>无限额度</Label>
                  <p className="text-xs text-muted-foreground">
                    启用后不限制使用额度
                  </p>
                </div>
                <Switch
                  checked={unlimitedQuota}
                  onCheckedChange={setUnlimitedQuota}
                  disabled={loading}
                />
              </div>

              {!unlimitedQuota && (
                <div className="grid gap-2">
                  <Label htmlFor="quota">额度（Tokens）</Label>
                  <Input
                    id="quota"
                    type="number"
                    placeholder="0"
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    可用的 Token 额度
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="rateLimit">速率限制（请求/分钟）</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  placeholder="留空表示不限制"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <div className="grid gap-2">
                <Label>模型限制</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入模型名称后按 Enter 或点击添加"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddModel()
                      }
                    }}
                    disabled={loading}
                  />
                  <Button type="button" variant="outline" onClick={handleAddModel} disabled={loading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {allowedModels.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allowedModels.map((model) => (
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
                ) : (
                  <p className="text-xs text-muted-foreground">
                    留空表示不限制模型
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>IP 白名单</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入 IP 地址后按 Enter 或点击添加"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddIp()
                      }
                    }}
                    disabled={loading}
                  />
                  <Button type="button" variant="outline" onClick={handleAddIp} disabled={loading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {ipWhitelist.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ipWhitelist.map((ip) => (
                      <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                        {ip}
                        <button
                          type="button"
                          onClick={() => handleRemoveIp(ip)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    留空表示不限制 IP
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {apiKey ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
