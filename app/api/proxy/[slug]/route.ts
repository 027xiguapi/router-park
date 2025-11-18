import { NextRequest, NextResponse } from 'next/server'

import { getProxyBySlug, incrementProxyViews } from '@/actions/proxy'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const proxy = await getProxyBySlug(slug)

    if (!proxy) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
    }

    // 增加浏览次数
    await incrementProxyViews(slug)

    return NextResponse.json(proxy)
  } catch (error) {
    console.error('Error fetching proxy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
