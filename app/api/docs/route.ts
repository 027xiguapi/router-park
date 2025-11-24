import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import {
  createDoc,
  getAllDocs,
  getDocsWithPagination,
} from '@/lib/db/docs'

import type { CreateDocInput, DocQueryOptions } from '@/lib/db/docs'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10)
    const search = searchParams.get('search') || undefined
    const locale = searchParams.get('locale') || undefined
    const sortBy = searchParams.get('sortBy') as 'latest' | 'title' | undefined

    // 使用新的分页功能还是保持兼容性
    const usePagination = searchParams.has('page') || searchParams.has('pageSize') || searchParams.has('search')

    const db = createDb()

    if (usePagination) {
      // 使用新的分页API
      const options: DocQueryOptions = {
        page: Math.max(1, page),
        pageSize: Math.min(100, Math.max(1, pageSize)), // 限制页面大小在1-100之间
        search,
        locale,
        sortBy: sortBy || 'latest'
      }

      const result = await getDocsWithPagination(db, options)

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } else {
      // 保持向后兼容性 - 返回所有文档
      const docsData = await getAllDocs(db)

      return NextResponse.json({
        success: true,
        data: docsData
      })
    }
  } catch (error) {
    console.error('Error fetching docs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch docs'
      },
      { status: 500 }
    )
  }
}

// POST /api/docs - 创建新文档
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateDocInput

    // 验证必填字段
    if (!body.slug || !body.locale || !body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug, locale, title and content are required'
        },
        { status: 400 }
      )
    }

    const db = createDb()
    const doc = await createDoc(db, body)

    return NextResponse.json(
      {
        success: true,
        data: doc
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating doc:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create doc'
      },
      { status: 500 }
    )
  }
}
