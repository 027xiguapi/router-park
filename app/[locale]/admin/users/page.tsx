'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { UsersTable } from '@/components/users-table'
import { UserDialog } from '@/components/user-dialog'
import { Toaster } from '@/components/ui/sonner'

import type { User } from '@/lib/db/users'

export default function UsersAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (user: User) => {
    setEditUser(user)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditUser(null)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">用户管理系统</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            管理系统用户，包括用户信息和权限
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>

      <UsersTable key={refreshKey} onEdit={handleEdit} />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editUser}
        onSuccess={handleSuccess}
      />

      <Toaster />
    </div>
  )
}
