'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, ExternalLink, Loader2, Plus, RefreshCw, Trash2, ShieldCheck, Heart, Search } from 'lucide-react'

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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'

import type { Router } from '@/lib/db/routers'
import {useUser} from "@/contexts/user-context";

interface RoutersTableProps {
  onEdit: (router: Router) => void
}

export function RoutersTable({ onEdit }: RoutersTableProps) {
  const [routers, setRouters] = useState<Router[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set())
  const { user } = useUser()
  const { toast } = useToast()

  // 分页和搜索状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(30)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 30,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // 加载路由器列表
  const loadRouters = async (page: number = currentPage, search: string = searchQuery) => {
    try {
      setLoading(true)

      // 构建URL参数
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      if (search.trim()) {
        params.set('search', search.trim())
      }

      // 默认按最新排序
      params.set('sortBy', 'latest')

      const url = `/api/routers?${params.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setRouters(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法加载路由器列表',
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

  // 检查所有路由器健康状态
  const checkAllHealth = async () => {
    try {
      setChecking(true)
      const response = await fetch('/api/routers/check-all', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        // 重新加载当前页面数据而不是替换全部数据
        await loadRouters(currentPage, searchQuery)
        toast({
          title: '检查完成',
          description: `已检查 ${data.count} 个路由器的健康状态`
        })
      } else {
        toast({
          title: '检查失败',
          description: data.error || '无法检查路由器状态',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '检查失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setChecking(false)
    }
  }

  // 删除路由器
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/routers/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        // 重新加载数据以保持分页正确性
        await loadRouters(currentPage, searchQuery)
        toast({
          title: '删除成功',
          description: '路由器已被删除'
        })
      } else {
        toast({
          title: '删除失败',
          description: data.error || '无法删除路由器',
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

  // 点赞/取消点赞
  const handleLike = async (routerId: string, currentLikes: number) => {
    if (likingIds.has(routerId)) return

    try {
      setLikingIds((prev) => new Set(prev).add(routerId))

      const response = await fetch(`/api/routers/${routerId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.id || '' })
      })

      const data = await response.json()

      if (data.success) {
        setRouters((prev) =>
          prev.map((r) => (r.id === routerId ? { ...r, likes: data.data.likes } : r))
        )
        toast({
          title: '点赞成功',
          description: '感谢你的支持！'
        })
      } else {
        toast({
          title: '点赞失败',
          description: data.error || '操作失败',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '点赞失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLikingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(routerId)
        return newSet
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

  // 分页处理
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
    }
  }

  // 生成分页按钮
  const renderPaginationItems = () => {
    const items = []
    const { page, totalPages } = pagination

    // 显示逻辑：1 ... 4 5 6 ... 10
    const showEllipsis = totalPages > 7

    if (showEllipsis) {
      // 总是显示第一页
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      )

      // 如果当前页离第一页很远，显示省略号
      if (page > 4) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      // 显示当前页周围的页码
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      // 如果当前页离最后页很远，显示省略号
      if (page < totalPages - 3) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      // 总是显示最后一页（如果不是第一页）
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={page === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      // 页数少时，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    return items
  }

  useEffect(() => {
    loadRouters()
  }, [])

  // 搜索变化时重新加载数据
  useEffect(() => {
    setCurrentPage(1) // 搜索时重置页码
    loadRouters(1, searchQuery)
  }, [searchQuery])

  // 页码变化时重新加载数据
  useEffect(() => {
    if (currentPage !== 1) { // 避免重复加载第一页
      loadRouters(currentPage, searchQuery)
    }
  }, [currentPage])

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('zh-CN')
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
            <h2 className="text-2xl font-bold tracking-tight">路由器管理</h2>
            <p className="text-muted-foreground">管理和监控所有路由器的状态</p>
          </div>
          <Button onClick={checkAllHealth} disabled={checking} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? '检查中...' : '检查所有'}
          </Button>
        </div>

        {/* 搜索栏 */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索路由器名称或网址..."
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

          {/* 总数显示 */}
          <div className="text-sm text-muted-foreground">
            共 {pagination.total} 条记录
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>认证</TableHead>
                <TableHead>点赞</TableHead>
                <TableHead>响应时间</TableHead>
                <TableHead>最后检查</TableHead>
                <TableHead>邀请链接</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `未找到包含 "${searchQuery}" 的路由器` : '暂无路由器数据，点击右上角添加按钮创建新路由器'}
                  </TableCell>
                </TableRow>
              ) : (
                routers.map((router) => (
                  <TableRow key={router.id}>
                    <TableCell className="font-medium">{router.name}</TableCell>
                    <TableCell>
                      <a
                        href={router.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <span className="max-w-[200px] truncate">{router.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={router.status === 'online' ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {router.status === 'online' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {router.status === 'online' ? '在线' : '离线'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {router.isVerified ? (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <ShieldCheck className="h-3 w-3" />
                          已认证
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          未认证
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(router.id, router.likes)}
                        disabled={likingIds.has(router.id)}
                        className="gap-1"
                      >
                        <Heart className={`h-4 w-4 ${router.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{router.likes}</span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      {router.responseTime > 0 ? `${router.responseTime}ms` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(router.lastCheck)}
                    </TableCell>
                    <TableCell>
                      {router.inviteLink ? (
                        <a
                          href={router.inviteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(router)}>
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(router.id)}
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

        {/* 分页组件 */}
        {pagination.totalPages > 1 && (
          <div className="space-y-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={!pagination.hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-muted-foreground">
              第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 个结果
            </div>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。确定要删除这个路由器吗？
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
