'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DocsTable } from '@/components/docs-table'
import { DocDialog } from '@/components/doc-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { Doc } from '@/lib/db/docs'

export default function DocsAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDoc, setEditDoc] = useState<Doc | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (doc: Doc) => {
    setEditDoc(doc)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditDoc(null)
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
          <h1 className="text-4xl font-bold tracking-tight">文档管理系统</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理和编辑您的文档内容
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加文档
        </Button>
      </div>

      <DocsTable key={refreshKey} onEdit={handleEdit} />

      <DocDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        doc={editDoc}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}
