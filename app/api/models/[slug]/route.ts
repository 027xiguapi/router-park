import { NextRequest, NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { getModelById, updateModel, deleteModel, getModelBySlugAndLocale } from '@/lib/db/models'
import { incrementModelViews } from '@/actions/model-content'

// GET /api/models/[slug] - 获取单个模型（通过 slug 和 locale）
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    console.log('[API /api/models/[slug]] 查询参数:', { slug, locale })

    const db = createDb()
    const model = await getModelBySlugAndLocale(db, slug, locale)

    console.log('[API /api/models/[slug]] 查询结果:', model ? '找到模型' : '未找到模型')

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // 异步增加浏览次数（不等待完成）
    incrementModelViews(slug, locale).catch((err) =>
      console.error('[API /api/models/[slug]] 增加浏览次数失败:', err)
    )

    // 将 model 格式转换为详情页期望的格式
    const response = {
      id: model.id,
      slug: model.slug,
      locale: model.locale,
      name: model.name,
      provider: model.provider,
      title: model.title,
      fullText: model.content,
      description: model.description || model.content.substring(0, 200), // 优先使用 description，否则取前200个字符
      coverImageUrl: model.coverImageUrl,
      status: model.status,
      contextWindow: model.contextWindow,
      maxOutputTokens: model.maxOutputTokens,
      officialUrl: model.officialUrl,
      apiDocUrl: model.apiDocUrl,
      pricing: model.pricing,
      capabilities: model.capabilities,
      releaseDate: model.releaseDate,
      views: model.views,
      likes: model.likes,
      publishedAt: model.releaseDate || model.createdAt, // 发布日期使用 releaseDate 或 createdAt
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API /api/models/[slug]] 错误:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/models/[slug] - 更新模型（通过 ID，slug 参数实际上是 ID）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: id } = await params
    const body = await request.json()

    const db = createDb()
    const model = await updateModel(db, id, body)

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: model
    })
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update model'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/models/[slug] - 删除模型（通过 ID，slug 参数实际上是 ID）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: id } = await params
    const db = createDb()
    await deleteModel(db, id)

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete model'
      },
      { status: 500 }
    )
  }
}
