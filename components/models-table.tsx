'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trash2, Search, Brain } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { Model } from '@/lib/db/models'

interface ModelsTableProps {
  onEdit: (model: Model) => void
}

export function ModelsTable({ onEdit }: ModelsTableProps) {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  // 分页和搜索状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(30)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [localeFilter, setLocaleFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 30,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // 加载模型列表
  const loadModels = async (
    page: number = currentPage,
    search: string = searchQuery,
    locale: string = localeFilter,
    provider: string = providerFilter,
    status: string = statusFilter
  ) => {
    try {
      setLoading(true)

      // 构建URL参数
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      if (search.trim()) {
        params.set('search', search.trim())
      }

      if (locale && locale !== 'all') {
        params.set('locale', locale)
      }

      if (provider && provider !== 'all') {
        params.set('provider', provider)
      }

      if (status && status !== 'all') {
        params.set('status', status)
      }

      // 默认按最新排序
      params.set('sortBy', 'latest')

      const url = `/api/models?${params.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setModels(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } else {
        toast({
          title: '加载失败',
          description: data.error || '无法加载模型列表',
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

  // 删除模型
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/models/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        // 重新加载数据以保持分页正确性
        await loadModels(currentPage, searchQuery, localeFilter, providerFilter, statusFilter)
        toast({
          title: '删除成功',
          description: '模型已被删除'
        })
      } else {
        toast({
          title: '删除失败',
          description: data.error || '无法删除模型',
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
    loadModels()
  }, [])

  // 搜索和筛选变化时重新加载数据
  useEffect(() => {
    setCurrentPage(1) // 搜索时重置页码
    loadModels(1, searchQuery, localeFilter, providerFilter, statusFilter)
  }, [searchQuery, localeFilter, providerFilter, statusFilter])

  // 页码变化时重新加载数据
  useEffect(() => {
    if (currentPage !== 1) { // 避免重复加载第一页
      loadModels(currentPage, searchQuery, localeFilter, providerFilter, statusFilter)
    }
  }, [currentPage])

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('zh-CN')
  }

  // 截取内容预览
  const getContentPreview = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // 获取状态标签样式
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'beta':
        return 'secondary'
      case 'deprecated':
        return 'destructive'
      default:
        return 'outline'
    }
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
            <h2 className="text-2xl font-bold tracking-tight">模型管理</h2>
            <p className="text-muted-foreground">管理所有大语言模型内容</p>
          </div>
        </div>

        {/* 搜索栏和筛选 */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex w-full max-w-3xl items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索模型名称、slug、标题或内容..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-10"
              />
            </div>
            <Select value={localeFilter} onValueChange={setLocaleFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有语言</SelectItem>
                <SelectItem value="zh-CN">中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="提供商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有提供商</SelectItem>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} size="default">
              搜索
            </Button>
          </div>

          {/* 总数显示 */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            共 {pagination.total} 条记录
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>提供商</TableHead>
                <TableHead>语言</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>浏览/点赞</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `未找到包含 "${searchQuery}" 的模型` : '暂无模型数据，点击右上角添加按钮创建新模型'}
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{model.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-1 py-0.5 rounded">{model.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{model.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{model.locale}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(model.status)} className="capitalize">
                        {model.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {model.views} / {model.likes}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(model.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(model)}>
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(model.id)}
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
              此操作无法撤销。确定要删除这个模型吗？
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
