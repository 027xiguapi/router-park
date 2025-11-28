import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { proxyComments, proxys, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

// GET - 获取某个 proxy 的所有评论（免登录）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 根据 slug 查找 proxy
    const proxy = await db
      .select()
      .from(proxys)
      .where(eq(proxys.slug, slug))
      .limit(1)

    if (proxy.length === 0) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
    }

    const proxyId = proxy[0].id

    // 获取该 proxy 的所有评论，包含用户信息
    const comments = await db
      .select({
        id: proxyComments.id,
        content: proxyComments.content,
        likes: proxyComments.likes,
        createdAt: proxyComments.createdAt,
        updatedAt: proxyComments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          image: users.image
        }
      })
      .from(proxyComments)
      .leftJoin(users, eq(proxyComments.userId, users.id))
      .where(eq(proxyComments.proxyId, proxyId))
      .orderBy(desc(proxyComments.createdAt))

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST - 提交新评论（需要登录）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 验证用户登录状态
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { content } = body

    // 验证评论内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // 限制评论长度
    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // 根据 slug 查找 proxy
    const proxy = await db
      .select()
      .from(proxys)
      .where(eq(proxys.slug, slug))
      .limit(1)

    if (proxy.length === 0) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
    }

    const proxyId = proxy[0].id

    // 创建新评论
    const newComment = await db
      .insert(proxyComments)
      .values({
        proxyId,
        userId: session.user.id,
        content: content.trim()
      })
      .returning()

    // 获取评论及用户信息
    const commentWithUser = await db
      .select({
        id: proxyComments.id,
        content: proxyComments.content,
        likes: proxyComments.likes,
        createdAt: proxyComments.createdAt,
        updatedAt: proxyComments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          image: users.image
        }
      })
      .from(proxyComments)
      .leftJoin(users, eq(proxyComments.userId, users.id))
      .where(eq(proxyComments.id, newComment[0].id))
      .limit(1)

    return NextResponse.json({
      success: true,
      data: commentWithUser[0]
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
