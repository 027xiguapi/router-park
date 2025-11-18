'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trash2, Search } from 'lucide-react'

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
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import type { User } from '@/lib/db/users'

interface UsersTableProps {
  onEdit: (user: User) => void
}

export function UsersTable({ onEdit }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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

  // 加载用户列表
  const loadUsers = async (page: number = currentPage, search: string = searchQuery) => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      if (search.trim()) {
        params.set('search', search.trim())
      }

      const url = `/api/users?${params.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } else {
        toast.error(data.error || '无法加载用户列表')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 删除用户
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/users/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        await loadUsers(currentPage, searchQuery)
        toast.success('删除成功')
      } else {
        toast.error(data.error || '无法删除用户')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
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

  // 获取用户名首字母
  const getUserInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    loadUsers(1, searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (currentPage !== 1) {
      loadUsers(currentPage, searchQuery)
    }
  }, [currentPage])

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
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
                placeholder="搜索用户名或邮箱..."
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
                <TableHead>用户</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>邮箱验证</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `未找到包含 "${searchQuery}" 的用户` : '暂无用户数据'}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} alt={user.name || user.email || 'User'} />
                          <AvatarFallback>{getUserInitials(user.name, user.email)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name || '未设置姓名'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="default">已验证</Badge>
                      ) : (
                        <Badge variant="secondary">未验证</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{user.id.slice(0, 8)}...</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(user.id)}
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
              此操作无法撤销。确定要删除这个用户吗？相关的账号、会话等数据也会被删除。
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
