'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trash2, Search, Server, ToggleLeft, ToggleRight } from 'lucide-react'

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

import type { AiModelConfig } from '@/lib/db/model-configs'

interface ModelConfigsTableProps {
  onEdit: (config: AiModelConfig) => void
}

export function ModelConfigsTable({ onEdit }: ModelConfigsTableProps) {
  const [configs, setConfigs] = useState<AiModelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const { toast } = useToast()

  // 加载配置列表
  const loadConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/model-configs?includeInactive=true')
      const data = await response.json()

      if (data.success) {
        setConfigs(data.data)
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法加载配置列表',
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

  // 删除配置
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/model-configs/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        await loadConfigs()
        toast({
          title: '删除成功',
          description: '配置已被删除'
        })
      } else {
        toast({
          title: '删除失败',
          description: data.error || '无法删除配置',
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

  // 切换激活状态
  const handleToggleStatus = async (config: AiModelConfig) => {
    try {
      const response = await fetch(`/api/model-configs/${config.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !config.isActive })
      })
      const data = await response.json()

      if (data.success) {
        await loadConfigs()
        toast({
          title: '状态已更新',
          description: `配置已${!config.isActive ? '启用' : '禁用'}`
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
    loadConfigs()
  }, [])

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('zh-CN')
  }

  // 过滤配置
  const filteredConfigs = configs.filter((config) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      config.name.toLowerCase().includes(query) ||
      config.provider.toLowerCase().includes(query) ||
      config.models.some((m) => m.toLowerCase().includes(query))
    )
  })

  // 隐藏 API Key 显示
  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return '********'
    return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
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
            <h2 className="text-2xl font-bold tracking-tight">配置列表</h2>
            <p className="text-muted-foreground">管理所有 AI 模型 API 配置</p>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex w-full max-w-md items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索名称、提供商或模型..."
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
            共 {filteredConfigs.length} 条记录
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>提供商</TableHead>
                <TableHead>API URL</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>模型数</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `未找到包含 "${searchQuery}" 的配置` : '暂无配置数据，点击右上角添加按钮创建新配置'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredConfigs.map((config) => (
                  <TableRow key={config.id} className={!config.isActive ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span>{config.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.provider}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded truncate block">
                        {config.apiUrl}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {maskApiKey(config.apiKey)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{config.models.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={() => handleToggleStatus(config)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {config.isActive ? '启用' : '禁用'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(config.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(config)}>
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(config.id)}
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
              此操作无法撤销。确定要删除这个配置吗？
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
