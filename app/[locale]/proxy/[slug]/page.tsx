import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import MarkdownRender from '@/components/markdown/mark-down-render'
import { Button } from '@/components/ui/button'

interface ProxySlugPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export const dynamicParams = true
export const revalidate = false

const fetchProxyData = async (
  slug: string
): Promise<{
  name: string
  url: string
  seoTitle: string
  seoDescription: string
  content: string | null
  models: string | null
  inviteLink: string | null
  views: number
  likes: number
}> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const response = await fetch(`${baseUrl}/api/proxy/${slug}`, {
    cache: 'force-cache'
  })

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch proxy data')
  }

  return response.json()
}

export async function generateMetadata(props: ProxySlugPageProps) {
  const { slug } = await props.params
  const { seoTitle, seoDescription } = await fetchProxyData(slug)

  return {
    title: seoTitle,
    description: seoDescription
  }
}

const ProxySlugPage = async (props: ProxySlugPageProps) => {
  const { slug } = await props.params
  const { name, url, seoTitle, seoDescription, content, models, inviteLink, views, likes } = await fetchProxyData(slug)
  const t = await getTranslations('proxy')

  if (!content) {
    notFound()
  }

  // Parse models if it's a JSON string
  let modelsList: string[] = []
  if (models) {
    try {
      modelsList = JSON.parse(models)
    } catch {
      // If parsing fails, treat it as a single model
      modelsList = [models]
    }
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      {/* Header Section */}
      <header className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">{name}:{seoTitle}</h1>
        <p className="text-lg text-muted-foreground">{seoDescription}</p>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>{views} 浏览</span>
          <span>{likes} 点赞</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              访问网站
            </Link>
          </Button>
          {inviteLink && (
            <Button asChild variant="outline">
              <Link href={inviteLink} target="_blank" rel="noopener noreferrer">
                获取邀请链接
              </Link>
            </Button>
          )}
        </div>

        {/* Models */}
        {modelsList.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">支持的模型：</h3>
            <div className="flex flex-wrap gap-2">
              {modelsList.map((model, index) => (
                <span
                  key={index}
                  className="rounded-md bg-secondary px-3 py-1 text-sm"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content Section */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownRender content={content} />
      </div>
    </article>
  )
}

export default ProxySlugPage
