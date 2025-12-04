import { NextRequest, NextResponse } from 'next/server'
import { createDb } from '@/lib/db'
import { apiKeys } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'

// DELETE - 删除 API Key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; keyId: string }> }
) {
  try {
    const session = await auth()
    const { userId, keyId } = await params

    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = createDb()
    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - 更新 API Key
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; keyId: string }> }
) {
  try {
    const session = await auth()
    const { userId, keyId } = await params

    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, status, quota, unlimitedQuota } = body

    const db = createDb()
    const [updatedKey] = await db
      .update(apiKeys)
      .set({
        ...(name && { name }),
        ...(status && { status }),
        ...(quota !== undefined && { quota }),
        ...(unlimitedQuota !== undefined && { unlimitedQuota }),
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
      .returning()

    return NextResponse.json(updatedKey)
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
