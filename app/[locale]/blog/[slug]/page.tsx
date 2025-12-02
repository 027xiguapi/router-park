import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import MarkdownRender from "@/components/markdown/mark-down-render";

interface PostSlugPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export const dynamicParams = true
export const revalidate = false

const fetchBlogData = async (
  slug: string,
  locale: string
): Promise<{
  title: string
  description: string
  fullText: string
  publishedAt: Date
  coverImageUrl: string
}> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const response = await fetch(`${baseUrl}/api/blog/${slug}?locale=${locale}`, {
    cache: 'force-cache'
  })

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch blog data')
  }

  return response.json()
}

export async function generateMetadata(props: PostSlugPageProps) {
  const { slug, locale } = await props.params
  const { title, description } = await fetchBlogData(slug, locale)

  return {
    title,
    description
  }
}

const PostSlugPage = async (props: PostSlugPageProps) => {
  const { slug, locale } = await props.params
  const { fullText: content, publishedAt, coverImageUrl, title } = await fetchBlogData(slug, locale)
  const t = await getTranslations('blog')

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
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">{t('backToBlogs') || '返回博客列表'}</span>
            </Button>
          </Link>
        </div>

        {/* 主内容卡片 */}
        <article className="max-w-4xl mx-auto">
          <Card className="border-border/50 shadow-lg overflow-hidden">
            {/* 封面图片 */}
            {/*{coverImageUrl && (*/}
            {/*  <div className="relative w-full aspect-video sm:aspect-[21/9] bg-muted overflow-hidden">*/}
            {/*    <Image*/}
            {/*      src={`${process.env.NEXT_PUBLIC_R2_DOMAIN}/${coverImageUrl}`}*/}
            {/*      alt={title}*/}
            {/*      fill*/}
            {/*      priority*/}
            {/*      className="object-cover"*/}
            {/*      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"*/}
            {/*    />*/}
            {/*    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />*/}

            {/*    /!* 标题覆盖在图片上（仅移动端） *!/*/}
            {/*    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:hidden">*/}
            {/*      <h1 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-3">*/}
            {/*        {title}*/}
            {/*      </h1>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*)}*/}

            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
              {/* 文章头部信息 */}
              <div className="mb-6 sm:mb-8">
                {/* 标题（桌面端或无封面图时显示） */}
                {(!coverImageUrl || true) && (
                  <h1 className="hidden md:block text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                    {title}
                  </h1>
                )}

                {/* 移动端无封面图时的标题 */}
                {!coverImageUrl && (
                  <h1 className="md:hidden text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                    {title}
                  </h1>
                )}

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

              {/* 文章内容 */}
              <MarkdownRender content={content} />

              {/* 文章底部分隔 */}
              <Separator className="mt-8 sm:mt-12" />

              {/* 底部操作区 */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {t('publishedAt', { date: formatDate(publishedAt) })}
                </div>

                <Link href="/blogs">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">{t('backToBlogs') || '返回博客列表'}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 推荐阅读 */}
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
              推荐阅读
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* 免费 Claude Code 卡片 */}
              <Link href="/free-claude-code">
                <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        免费 Claude Code
                      </h3>
                      <p className="text-sm text-muted-foreground flex-grow">
                        探索如何免费使用 Claude Code 进行 AI 辅助编程，提升开发效率。
                      </p>
                      <div className="mt-4 flex items-center text-sm text-primary font-medium">
                        了解更多
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* 免费 LLM API 卡片 */}
              <Link href="/free-llm-api">
                <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        免费 LLM API
                      </h3>
                      <p className="text-sm text-muted-foreground flex-grow">
                        发现各种免费的大语言模型 API 服务，轻松集成 AI 能力到你的项目中。
                      </p>
                      <div className="mt-4 flex items-center text-sm text-primary font-medium">
                        了解更多
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

export default PostSlugPage
