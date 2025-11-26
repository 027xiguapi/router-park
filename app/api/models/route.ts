import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createModel,
  getAllModels,
  getModelsWithPagination,
} from '@/lib/db/models'

import type { CreateModelInput, ModelQueryOptions } from '@/lib/db/models'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10)
    const search = searchParams.get('search') || undefined
    const locale = searchParams.get('locale') || undefined
    const provider = searchParams.get('provider') || undefined
    const status = searchParams.get('status') || undefined
    const sortBy = searchParams.get('sortBy') as 'latest' | 'name' | 'views' | 'likes' | undefined

    // 使用新的分页功能还是保持兼容性
    const usePagination = searchParams.has('page') || searchParams.has('pageSize') || searchParams.has('search')

    const db = createDb()

    if (usePagination) {
      // 使用新的分页API
      const options: ModelQueryOptions = {
        page: Math.max(1, page),
        pageSize: Math.min(100, Math.max(1, pageSize)), // 限制页面大小在1-100之间
        search,
        locale,
        provider,
        status,
        sortBy: sortBy || 'latest'
      }

      const result = await getModelsWithPagination(db, options)

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } else {
      // 保持向后兼容性 - 返回所有模型
      const modelsData = await getAllModels(db)

      return NextResponse.json({
        success: true,
        data: modelsData
      })
    }
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch models'
      },
      { status: 500 }
    )
  }
}

// POST /api/models - 创建新模型
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateModelInput

    // 验证必填字段
    if (!body.slug || !body.locale || !body.name || !body.provider || !body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug, locale, name, provider, title and content are required'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const model = await createModel(db, body)

    return NextResponse.json(
      {
        success: true,
        data: model
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create model'
      },
      { status: 500 }
    )
  }
}
