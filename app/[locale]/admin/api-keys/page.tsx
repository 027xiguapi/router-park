'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ApiKeysTable } from '@/components/api-keys-table'
import { ApiKeyDialog } from '@/components/api-key-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { ApiKey } from '@/lib/db/api-keys'

export default function ApiKeysAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editKey, setEditKey] = useState<ApiKey | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (apiKey: ApiKey) => {
    setEditKey(apiKey)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditKey(null)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">API 密钥管理</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理用户 API 密钥
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增密钥
        </Button>
      </div>

      <ApiKeysTable key={refreshKey} onEdit={handleEdit} />

      <ApiKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        apiKey={editKey}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}
