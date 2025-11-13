'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RoutersTable } from '@/components/routers-table'
import { RouterDialog } from '@/components/router-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { Router } from '@/lib/db/routers'

export default function RoutersAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRouter, setEditRouter] = useState<Router | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (router: Router) => {
    setEditRouter(router)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditRouter(null)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    // 刷新表格
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">路由器管理系统</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理和监控您的路由器网络状态
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加路由器
        </Button>
      </div>

      <RoutersTable key={refreshKey} onEdit={handleEdit} />

      <RouterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        router={editRouter}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}
