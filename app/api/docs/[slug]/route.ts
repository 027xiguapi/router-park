import { NextRequest, NextResponse } from 'next/server'

import { getDocBySlug, updateDocById, deleteDocById } from '@/actions/doc-content'

// GET /api/docs/[slug] - 获取单个文档（通过 slug 和 locale）
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    console.log('[API /api/docs/[slug]] 查询参数:', { slug, locale })

    const doc = await getDocBySlug(slug, locale)

    console.log('[API /api/docs/[slug]] 查询结果:', doc ? '找到文档' : '未找到文档')

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // 将 doc 格式转换为详情页期望的格式
    const response = {
      id: doc.id,
      slug: doc.slug,
      locale: doc.locale,
      title: doc.title,
      fullText: doc.content,
      description: doc.content.substring(0, 200), // 取前200个字符作为描述
      coverImageUrl: doc.coverImageUrl,
      publishedAt: doc.createdAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API /api/docs/[slug]] 错误:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/docs/[slug] - 更新文档（通过 ID，slug 参数实际上是 ID）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: id } = await params
    const body = await request.json()

    const doc = await updateDocById(id, body)

    if (!doc) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: doc
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update document'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/docs/[slug] - 删除文档（通过 ID，slug 参数实际上是 ID）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: id } = await params
    await deleteDocById(id)

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete document'
      },
      { status: 500 }
    )
  }
}
