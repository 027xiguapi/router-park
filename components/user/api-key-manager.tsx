'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Plus, Copy, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

interface ApiKey {
  id: string
  key: string
  name: string
  status: 'active' | 'inactive' | 'exhausted'
  quota: number
  usedQuota: number
  unlimitedQuota: boolean
  requestCount: number
  expiresAt: Date | null
  createdAt: Date
  lastUsedAt: Date | null
}

export function ApiKeyManager({ userId }: { userId: string }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyQuota, setNewKeyQuota] = useState('1000000')
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchApiKeys()
  }, [userId])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/api-keys`)
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: '错误',
        description: '请输入密钥名称',
        variant: 'destructive'
      })
      return
    }

    const quota = parseInt(newKeyQuota)
    if (isNaN(quota) || quota < 0) {
      toast({
        title: '错误',
        description: '请输入有效的额度（大于等于0的整数）',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/user/${userId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          quota: quota,
          unlimitedQuota: quota === 0
        })
      })

      if (response.ok) {
        const newKey = await response.json()
        setApiKeys([newKey, ...apiKeys])
        setIsCreateDialogOpen(false)
        setNewKeyName('')
        setNewKeyQuota('1000000')
        toast({
          title: '创建成功',
          description: '新的 API Key 已创建，请立即保存'
        })
      } else {
        throw new Error('Failed to create API key')
      }
    } catch (error) {
      toast({
        title: '创建失败',
        description: '无法创建 API Key，请重试',
        variant: 'destructive'
      })
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('确定要删除这个 API Key 吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/user/${userId}/api-keys/${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== keyId))
        toast({
          title: '删除成功',
          description: 'API Key 已删除'
        })
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '无法删除 API Key，请重试',
        variant: 'destructive'
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: '已复制',
      description: 'API Key 已复制到剪贴板'
    })
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.substring(0, 8)}${'*'.repeat(20)}${key.substring(key.length - 4)}`
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      inactive: 'secondary',
      exhausted: 'destructive'
    }
    const labels: Record<string, string> = {
      active: '活跃',
      inactive: '未激活',
      exhausted: '已耗尽'
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Key 管理</CardTitle>
              <CardDescription>创建和管理您的 API 密钥</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建新密钥
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新的 API Key</DialogTitle>
                  <DialogDescription>
                    系统将自动生成 sk- 开头的 API 密钥
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">密钥名称 *</Label>
                    <Input
                      id="name"
                      placeholder="例如：生产环境密钥"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      为密钥设置一个易于识别的名称
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quota">额度（tokens）*</Label>
                    <Input
                      id="quota"
                      type="number"
                      placeholder="1000000"
                      value={newKeyQuota}
                      onChange={(e) => setNewKeyQuota(e.target.value)}
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      设置此密钥可使用的 token 额度，0 表示无限额度
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">💡 提示</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 密钥格式：sk-xxxxxxxx（48位随机字符）</li>
                      <li>• 创建后请立即保存，密钥不可恢复</li>
                      <li>• 建议定期更换密钥以保证安全</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createApiKey}>创建密钥</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无 API Key</p>
              <p className="text-sm mt-2">点击上方按钮创建您的第一个密钥</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>密钥</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>额度</TableHead>
                    <TableHead>请求次数</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
                      <TableCell>
                        {apiKey.unlimitedQuota ? (
                          <Badge variant="secondary">无限</Badge>
                        ) : (
                          <span className="text-sm">
                            {apiKey.usedQuota.toLocaleString()} /{' '}
                            {apiKey.quota.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{apiKey.requestCount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(apiKey.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteApiKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
