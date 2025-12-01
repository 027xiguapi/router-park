'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModelConfigsTable } from '@/components/model-configs-table'
import { ModelConfigDialog } from '@/components/model-config-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { AiModelConfig } from '@/lib/db/model-configs'

export default function ModelConfigsAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<AiModelConfig | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (config: AiModelConfig) => {
    setEditConfig(config)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditConfig(null)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">模型配置管理</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理 AI 模型 API 配置
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增配置
        </Button>
      </div>

      <ModelConfigsTable key={refreshKey} onEdit={handleEdit} />

      <ModelConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        config={editConfig}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}
