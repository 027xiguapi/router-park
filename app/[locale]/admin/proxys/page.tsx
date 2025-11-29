'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ProxysTable } from '@/components/proxys-table'
import { ProxyDialog } from '@/components/proxy-dialog'
import { AddProxyUrlDialog } from '@/components/add-proxy-url-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { Proxy } from '@/lib/db/proxys'

export default function ProxysAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addUrlDialogOpen, setAddUrlDialogOpen] = useState(false)
  const [editProxy, setEditProxy] = useState<Proxy | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (proxy: Proxy) => {
    setEditProxy(proxy)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setAddUrlDialogOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Proxy 管理系统</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理 AI 代理中转站，包括 SEO 优化内容
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加 Proxy
        </Button>
      </div>

      <ProxysTable key={refreshKey} onEdit={handleEdit} />

      <AddProxyUrlDialog
        open={addUrlDialogOpen}
        onOpenChange={setAddUrlDialogOpen}
        onSuccess={handleSuccess}
      />

      <ProxyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        proxy={editProxy}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}
