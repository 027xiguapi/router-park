'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trash2, Search, Key, Copy, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'

import type { ApiKey } from '@/lib/db/api-keys'

interface ApiKeysTableProps {
  onEdit: (apiKey: ApiKey) => void
}

export function ApiKeysTable({ onEdit }: ApiKeysTableProps) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  // 加载密钥列表
  const loadKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/api-keys?includeInactive=true')
      const data = await response.json()

      if (data.success) {
        setKeys(data.data)
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法加载密钥列表',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 删除密钥
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/api-keys/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        await loadKeys()
        toast({
          title: '删除成功',
          description: '密钥已被删除'
        })
      } else {
        toast({
          title: '删除失败',
          description: data.error || '无法删除密钥',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setDeleteId(null)
    }
  }

  // 切换状态
  const handleToggleStatus = async (apiKey: ApiKey) => {
    try {
      const newStatus = apiKey.status === 'active' ? 'inactive' : 'active'
      const response = await fetch(`/api/api-keys/${apiKey.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await response.json()

      if (data.success) {
        await loadKeys()
        toast({
          title: '状态已更新',
          description: `密钥已${newStatus === 'active' ? '启用' : '禁用'}`
        })
      } else {
        toast({
          title: '更新失败',
          description: data.error || '无法更新状态',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '更新失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    }
  }

  // 复制密钥
  const handleCopyKey = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: '已复制',
        description: 'API 密钥已复制到剪贴板'
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法复制到剪贴板',
        variant: 'destructive'
      })
    }
  }

  // 搜索处理
  const handleSearch = () => {
    setSearchQuery(searchInput.trim())
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    if (!value.trim()) {
      setSearchQuery('')
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    loadKeys()
  }, [])

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('zh-CN')
  }

  // 过滤密钥
  const filteredKeys = keys.filter((key) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      key.name.toLowerCase().includes(query) ||
      key.key.toLowerCase().includes(query) ||
      (key.group && key.group.toLowerCase().includes(query))
    )
  })

  // 隐藏密钥显示
  const maskKey = (key: string) => {
    if (key.length <= 12) return key.substring(0, 4) + '****'
    return key.substring(0, 7) + '****' + key.substring(key.length - 4)
  }

  // 获取状态标签样式
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'expired':
      case 'exhausted':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // 格式化额度显示
  const formatQuota = (apiKey: ApiKey) => {
    if (apiKey.unlimitedQuota) {
      return '无限'
    }
    return `${apiKey.usedQuota.toLocaleString()} / ${apiKey.quota.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">密钥列表</h2>
            <p className="text-muted-foreground">管理所有 API 密钥</p>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex w-full max-w-md items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索名称、密钥或分组..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} size="default">
              搜索
            </Button>
          </div>

          <div className="text-sm text-muted-foreground whitespace-nowrap">
            共 {filteredKeys.length} 条记录
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>密钥</TableHead>
                <TableHead>分组</TableHead>
                <TableHead>额度</TableHead>
                <TableHead>请求数</TableHead>
                <TableHead>过期时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后使用</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `未找到包含 "${searchQuery}" 的密钥` : '暂无密钥数据，点击右上角添加按钮创建新密钥'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredKeys.map((apiKey) => (
                  <TableRow key={apiKey.id} className={apiKey.status !== 'active' ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span>{apiKey.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {maskKey(apiKey.key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                        >
                          {copiedId === apiKey.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {apiKey.group ? (
                        <Badge variant="outline">{apiKey.group}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={apiKey.unlimitedQuota ? 'text-green-500' : ''}>
                        {formatQuota(apiKey)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{apiKey.requestCount.toLocaleString()}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : '永不过期'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={apiKey.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(apiKey)}
                        />
                        <Badge variant={getStatusVariant(apiKey.status)}>
                          {apiKey.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(apiKey.lastUsedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(apiKey)}>
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。确定要删除这个 API 密钥吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
