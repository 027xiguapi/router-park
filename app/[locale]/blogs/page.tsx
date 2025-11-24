import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getPaginatedDocs } from '@/actions/doc-content'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'
import { Calendar, FileText } from 'lucide-react'

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

  const { docs: docsList, pagination } = await getPaginatedDocs(locale, currentPage, pageSize)

  const t = await getTranslations('blogs')

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

        {docsList.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 sm:py-16 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground">{t('noArticles')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 文章网格 */}
            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {docsList.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/blog/${doc.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 border-border/50 overflow-hidden">
                    <CardHeader className="space-y-2 sm:space-y-3">
                      {/* 标题 */}
                      <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.title}
                      </CardTitle>

                      {/* 发布日期 */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
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
                <div className="flex justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/blogs?page=${pageNum}`}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pageNum === pagination.currentPage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
