import { NextResponse } from 'next/server'
import { createDb } from '@/lib/db'
import { docs } from '@/lib/db/schema'

// 临时调试端点 - 列出所有文档
export async function GET() {
  try {
    const db = createDb()
    const allDocs = await db
      .select({
        id: docs.id,
        slug: docs.slug,
        locale: docs.locale,
        title: docs.title
      })
      .from(docs)
      .limit(20)

    return NextResponse.json({
      total: allDocs.length,
      docs: allDocs
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
