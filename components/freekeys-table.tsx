'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trash2, Search, Eye, EyeOff, Copy, Check } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

import type { FreeKey } from '@/lib/db/freeKeys'

interface FreeKeysTableProps {
  onEdit: (freeKey: FreeKey) => void
}

export function FreeKeysTable({ onEdit }: FreeKeysTableProps) {
  const [freeKeys, setFreeKeys] = useState<FreeKey[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const { toast } = useToast()

  // 加载免费密钥列表
  const loadFreeKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/freeKeys')
      const data = await response.json()

      if (data.success) {
        setFreeKeys(data.data)
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法加载免费密钥列表',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error loading free keys:', error)
      toast({
        title: '加载失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFreeKeys()
  }, [])

  // 删除免费密钥
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/freeKeys/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: '删除成功',
          description: '免费密钥已删除'
        })
        loadFreeKeys() // 重新加载列表
      } else {
        toast({
          title: '删除失败',
          description: data.error || '无法删除免费密钥',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting free key:', error)
      toast({
        title: '删除失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    }
    setDeleteId(null)
  }

  // 复制密钥
  const handleCopyKeys = async (keyValues: string) => {
    try {
      const keys = JSON.parse(keyValues) as string[]
      const keysText = keys.join('\n')
      await navigator.clipboard.writeText(keysText)
      setCopiedKey(keyValues)
      toast({
        title: '复制成功',
        description: `已复制 ${keys.length} 个密钥`
      })
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法复制密钥',
        variant: 'destructive'
      })
    }
  }

  // 搜索处理
  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 过滤免费密钥
  const filteredFreeKeys = freeKeys.filter((freeKey) => {
    const matchesSearch = !searchQuery ||
      freeKey.keyType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = showInactive || freeKey.status === 'active'

    return matchesSearch && matchesStatus
  })

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  // 获取状态Badge颜色
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'exhausted':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // 获取类型Badge颜色
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'claude':
        return 'default'
      case 'llm':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // 解析并显示密钥数量
  const getKeyCount = (keyValues: string) => {
    try {
      const keys = JSON.parse(keyValues) as string[]
      return keys.length
    } catch {
      return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和过滤 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="搜索密钥类型..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="max-w-sm"
          />
          <Button onClick={handleSearch} size="sm" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={showInactive}
            onCheckedChange={setShowInactive}
            id="show-inactive"
          />
          <label htmlFor="show-inactive" className="text-sm">
            {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            显示非活跃
          </label>
        </div>
      </div>

      {/* 表格 */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>类型</TableHead>
              <TableHead>密钥数量</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFreeKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  没有找到免费密钥
                </TableCell>
              </TableRow>
            ) : (
              filteredFreeKeys.map((freeKey) => (
                <TableRow key={freeKey.id}>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(freeKey.keyType)}>
                      {freeKey.keyType.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getKeyCount(freeKey.keyValues)} 个密钥</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyKeys(freeKey.keyValues)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedKey === freeKey.keyValues ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(freeKey.status)}>
                      {freeKey.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(freeKey.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(freeKey.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(freeKey)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(freeKey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个免费密钥吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}