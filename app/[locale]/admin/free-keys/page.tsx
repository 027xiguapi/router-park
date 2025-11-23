'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FreeKeysTable } from '@/components/freekeys-table'
import { FreeKeyDialog } from '@/components/freekey-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { FreeKey } from '@/lib/db/freeKeys'

export default function FreeKeysAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editFreeKey, setEditFreeKey] = useState<FreeKey | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (freeKey: FreeKey) => {
    setEditFreeKey(freeKey)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditFreeKey(null)
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
          <h1 className="text-4xl font-bold tracking-tight">免费密钥管理系统</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理和维护您的免费 API 密钥配置
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加免费密钥
        </Button>
      </div>

      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card text-card-foreground p-6 rounded-lg border">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="font-semibold">Claude 密钥</h3>
            </div>
            <p className="text-2xl font-bold mt-2">-</p>
            <p className="text-xs text-muted-foreground mt-1">
              用于 Claude Code 和 Codex
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg border">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="font-semibold">LLM 密钥</h3>
            </div>
            <p className="text-2xl font-bold mt-2">-</p>
            <p className="text-xs text-muted-foreground mt-1">
              用于大模型 API 接口
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg border">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <h3 className="font-semibold">总计</h3>
            </div>
            <p className="text-2xl font-bold mt-2">-</p>
            <p className="text-xs text-muted-foreground mt-1">
              所有类型密钥总数
            </p>
          </div>
        </div>

        <FreeKeysTable key={refreshKey} onEdit={handleEdit} />
      </div>

      <FreeKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        freeKey={editFreeKey}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}