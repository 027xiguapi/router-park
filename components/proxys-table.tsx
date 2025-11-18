'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, Trash2, Search, Eye } from 'lucide-react'

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
  PaginationEllipsis
} from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'

import type { Proxy } from '@/lib/db/proxys'

interface ProxysTableProps {
  onEdit: (proxy: Proxy) => void
}

export function ProxysTable({ onEdit }: ProxysTableProps) {
  const [proxys, setProxys] = useState<Proxy[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
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

  // 加载 Proxy 列表
  const loadProxys = async (page: number = currentPage, search: string = searchQuery) => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())
      params.set('status', 'all') // 显示所有状态

      if (search.trim()) {
        params.set('search', search.trim())
      }

      params.set('sortBy', 'latest')

      const url = `/api/proxys?${params.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setProxys(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法加载 Proxy 列表',
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

  // 删除 Proxy
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/proxys/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        await loadProxys(currentPage, searchQuery)
        toast({
          title: '删除成功',
          description: 'Proxy 已被删除'
        })
      } else {
        toast({
          title: '删除失败',
          description: data.error || '无法删除 Proxy',
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

    const showEllipsis = totalPages > 7

    if (showEllipsis) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      )

      if (page > 4) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      if (page < totalPages - 3) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={page === totalPages}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={page === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    return items
  }

  useEffect(() => {
    loadProxys()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    loadProxys(1, searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (currentPage !== 1) {
      loadProxys(currentPage, searchQuery)
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
        {/* 搜索栏 */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索 Proxy 名称、URL、slug..."
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

          <div className="text-sm text-muted-foreground">
            共 {pagination.total} 条记录
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>浏览</TableHead>
                <TableHead>点赞</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proxys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `未找到包含 "${searchQuery}" 的 Proxy` : '暂无 Proxy 数据，点击右上角添加按钮创建新 Proxy'}
                  </TableCell>
                </TableRow>
              ) : (
                proxys.map((proxy) => (
                  <TableRow key={proxy.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{proxy.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{proxy.slug}</code>
                    </TableCell>
                    <TableCell>
                      <a
                        href={proxy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline max-w-[200px]"
                      >
                        <span className="truncate">{proxy.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={proxy.status === 'active' ? 'default' : 'secondary'}>
                        {proxy.status === 'active' ? '活跃' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{proxy.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {proxy.views}
                      </div>
                    </TableCell>
                    <TableCell>{proxy.likes}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(proxy.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(proxy)}>
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(proxy.id)}
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
              此操作无法撤销。确定要删除这个 Proxy 吗？
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
