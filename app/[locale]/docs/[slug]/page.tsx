import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import MarkdownRender from '@/components/markdown/mark-down-render'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

interface DocSlugPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export const dynamicParams = true
export const revalidate = false

const fetchDocData = async (
  slug: string,
  locale: string
): Promise<{
  title: string
  description: string
  fullText: string
  publishedAt: Date
  slug: string
}> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const response = await fetch(`${baseUrl}/api/docs/${slug}?locale=${locale}`, {
    cache: 'force-cache'
  })

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch document data')
  }

  return response.json()
}

export async function generateMetadata(props: DocSlugPageProps) {
  const { slug, locale } = await props.params
  const { title, description } = await fetchDocData(slug, locale)

  return {
    title,
    description
  }
}

const DocSlugPage = async (props: DocSlugPageProps) => {
  const { slug, locale } = await props.params
  const { fullText: content, publishedAt, title } = await fetchDocData(slug, locale)
  const t = await getTranslations('docs')

  if (!content) {
    notFound()
  }

  // 计算阅读时间（假设每分钟阅读200字）
  const wordCount = content.length
  const readTime = Math.ceil(wordCount / 200)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* 返回按钮 */}
        <div className="mb-6 sm:mb-8">
          <Link href="/docs">
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">{t('backToDocs') || '返回文档列表'}</span>
            </Button>
          </Link>
        </div>

        {/* 主内容卡片 */}
        <article className="max-w-4xl mx-auto">
          <Card className="border-border/50 shadow-lg overflow-hidden">

            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
              {/* 文档头部信息 */}
              <div className="mb-6 sm:mb-8">
                {/* 标题 */}
                <h1 className="hidden md:block text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                  {title}
                </h1>

                {/* 移动端标题 */}
                <h1 className="md:hidden text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                  {title}
                </h1>

                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(publishedAt)}</span>
                  </div>

                  {readTime > 0 && (
                    <>
                      <span className="text-border">•</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{t('readTime', { minutes: readTime }) || `${readTime} 分钟阅读`}</span>
                      </div>
                    </>
                  )}

                  {wordCount > 0 && (
                    <>
                      <span className="hidden sm:inline text-border">•</span>
                      <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                        {wordCount.toLocaleString()} 字
                      </Badge>
                    </>
                  )}
                </div>

                <Separator className="mt-6 sm:mt-8" />
              </div>

              {/* 文档内容 */}
              <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold
                prose-headings:text-foreground
                prose-h1:text-2xl sm:prose-h1:text-3xl lg:prose-h1:text-4xl
                prose-h2:text-xl sm:prose-h2:text-2xl lg:prose-h2:text-3xl
                prose-h3:text-lg sm:prose-h3:text-xl lg:prose-h3:text-2xl
                prose-h1:bg-gradient-to-r prose-h1:from-primary prose-h1:via-orange-500 prose-h1:to-amber-500
                prose-h1:bg-clip-text prose-h1:text-transparent
                prose-h2:text-primary
                prose-p:text-foreground
                prose-p:leading-relaxed
                prose-a:text-primary
                prose-a:no-underline
                prose-a:font-medium
                hover:prose-a:text-orange-500
                hover:prose-a:underline
                prose-strong:text-foreground
                prose-strong:font-semibold
                prose-code:text-primary
                prose-code:bg-muted
                prose-code:px-1.5
                prose-code:py-0.5
                prose-code:rounded
                prose-code:before:content-none
                prose-code:after:content-none
                prose-pre:bg-muted
                prose-pre:border
                prose-pre:border-border
                prose-img:rounded-lg
                prose-img:shadow-md
                prose-blockquote:border-l-primary
                prose-blockquote:bg-muted/50
                prose-blockquote:py-1
                prose-blockquote:px-4
                prose-ul:list-disc
                prose-ol:list-decimal
                prose-li:text-foreground
                prose-table:border-collapse
                prose-th:bg-muted
                prose-th:border
                prose-th:border-border
                prose-td:border
                prose-td:border-border
              ">
                <MarkdownRender content={content} />
              </div>

              {/* 文档底部分隔 */}
              <Separator className="mt-8 sm:mt-12" />

              {/* 底部操作区 */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {t('publishedAt', { date: formatDate(publishedAt) })}
                </div>

                <Link href="/docs">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">{t('backToDocs') || '返回文档列表'}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  )
}

export default DocSlugPage
