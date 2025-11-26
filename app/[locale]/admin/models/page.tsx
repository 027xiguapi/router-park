'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ModelsTable } from '@/components/models-table'
import { ModelDialog } from '@/components/model-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { Model } from '@/lib/db/models'

export default function ModelsAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editModel, setEditModel] = useState<Model | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (model: Model) => {
    setEditModel(model)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditModel(null)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">模型管理</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理 AI 模型数据
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增模型
        </Button>
      </div>

      <ModelsTable key={refreshKey} onEdit={handleEdit} />

      <ModelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        model={editModel}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}
