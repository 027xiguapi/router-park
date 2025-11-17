'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, Trash2, Search, Eye, EyeOff } from 'lucide-react'

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

import type { VPN } from '@/lib/db/vpns'

interface VpnsTableProps {
  onEdit: (vpn: VPN) => void
}

export function VpnsTable({ onEdit }: VpnsTableProps) {
  const [vpns, setVpns] = useState<VPN[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const { toast } = useToast()

  // 加载VPN列表
  const loadVpns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vpns')
      const data = await response.json()

      if (data.success) {
        setVpns(data.data)
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法加载VPN列表',
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

  // 删除VPN
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/vpns/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        await loadVpns()
        toast({
          title: '删除成功',
          description: 'VPN已被删除'
        })
      } else {
        toast({
          title: '删除失败',
          description: data.error || '无法删除VPN',
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
  const handleToggleActive = async (vpnId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/vpns/${vpnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      const data = await response.json()

      if (data.success) {
        setVpns((prev) =>
          prev.map((vpn) =>
            vpn.id === vpnId ? { ...vpn, isActive: !isActive } : vpn
          )
        )
        toast({
          title: '状态更新成功',
          description: `VPN已${!isActive ? '激活' : '停用'}`
        })
      } else {
        toast({
          title: '状态更新失败',
          description: data.error || '无法更新状态',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '状态更新失败',
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

    // 如果输入为空，立即清除搜索
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
    loadVpns()
  }, [])

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('zh-CN')
  }

  // 过滤VPN数据
  const filteredVpns = vpns.filter((vpn) => {
    const matchesSearch = !searchQuery ||
      vpn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vpn.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vpn.description && vpn.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = showInactive || vpn.isActive

    return matchesSearch && matchesStatus
  })

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
            <h2 className="text-2xl font-bold tracking-tight">VPN管理</h2>
            <p className="text-muted-foreground">管理所有VPN服务配置</p>
          </div>
        </div>

        {/* 搜索和过滤栏 */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索VPN名称、网址或描述..."
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

          {/* 显示选项 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <label
                htmlFor="show-inactive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                显示已停用
              </label>
            </div>

            {/* 总数显示 */}
            <div className="text-sm text-muted-foreground">
              共 {filteredVpns.length} 条记录
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>订阅链接</TableHead>
                <TableHead>邀请链接</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVpns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `未找到包含 "${searchQuery}" 的VPN` : '暂无VPN数据，点击右上角添加按钮创建新VPN'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVpns.map((vpn) => (
                  <TableRow key={vpn.id} className={!vpn.isActive ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{vpn.name}</TableCell>
                    <TableCell>
                      <a
                        href={vpn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <span className="max-w-[150px] truncate">{vpn.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <a
                        href={vpn.subscriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <span className="max-w-[120px] truncate">{vpn.subscriptionUrl}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      {vpn.inviteLink ? (
                        <a
                          href={vpn.inviteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <span className="max-w-[100px] truncate">{vpn.inviteLink}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={vpn.isActive ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {vpn.isActive ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          {vpn.isActive ? '激活' : '停用'}
                        </Badge>
                        <Switch
                          checked={vpn.isActive}
                          onCheckedChange={() => handleToggleActive(vpn.id, vpn.isActive)}
                          size="sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{vpn.sortOrder}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(vpn.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={vpn.description || ''}>
                        {vpn.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(vpn)}>
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(vpn.id)}
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
              此操作无法撤销。确定要删除这个VPN配置吗？
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