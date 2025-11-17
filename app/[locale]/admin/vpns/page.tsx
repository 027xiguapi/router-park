'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { VpnsTable } from '@/components/vpns-table'
import { VpnDialog } from '@/components/vpn-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { VPN } from '@/lib/db/vpns'

export default function VpnsAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editVpn, setEditVpn] = useState<VPN | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (vpn: VPN) => {
    setEditVpn(vpn)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditVpn(null)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    // 刷新表格
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-10 mt-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">VPN管理系统</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理和维护您的VPN服务配置
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加VPN
        </Button>
      </div>

      <VpnsTable key={refreshKey} onEdit={handleEdit} />

      <VpnDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vpn={editVpn}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}