import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

import { getPaginatedArticles } from '@/actions/ai-content'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blogs')

  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  }
}

export default async function BlogPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const { page } = await searchParams
  const currentPage = page ? parseInt(page) : 1
  const pageSize = 18

  const { articles, pagination } = await getPaginatedArticles({
    locale,
    page: currentPage,
    pageSize
  })

  const t = await getTranslations('blogs')

  const publishedArticles = articles.filter((article) => article.createdAt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 mt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* 页面标题 */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent mb-3 sm:mb-4">
            {t('pageTitle')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            {t('metaDescription')}
          </p>
        </div>

        {publishedArticles.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 sm:py-16 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground">{t('noArticles')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 文章网格 */}
            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {publishedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 border-border/50 overflow-hidden">
                    {/* 封面图片 */}
                    {/*{article.coverImageUrl && (*/}
                    {/*  <div className="relative w-full aspect-video overflow-hidden bg-muted">*/}
                    {/*    <Image*/}
                    {/*      src={`${process.env.NEXT_PUBLIC_R2_DOMAIN}/${article.coverImageUrl}`}*/}
                    {/*      alt={article.title}*/}
                    {/*      fill*/}
                    {/*      className="object-cover transition-transform duration-300 group-hover:scale-105"*/}
                    {/*      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"*/}
                    {/*    />*/}
                    {/*    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />*/}
                    {/*  </div>*/}
                    {/*)}*/}

                    <CardHeader className="space-y-2 sm:space-y-3">
                      {/* 标题 */}
                      <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>

                      {/* 发布日期 */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                        {article.readTime && (
                          <>
                            <span className="text-border">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              <span>{article.readTime}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* 摘要 */}
                      <CardDescription className="line-clamp-3 text-xs sm:text-sm leading-relaxed">
                        {article.excerpt}
                      </CardDescription>

                      {/* 阅读更多 */}
                      <div className="mt-3 sm:mt-4">
                        <span className="inline-flex items-center text-xs sm:text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          {t('readMore') || '阅读更多'}
                          <svg
                            className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 sm:mt-10 md:mt-12">
                <BlogPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
