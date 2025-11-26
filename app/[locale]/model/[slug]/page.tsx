import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import Markdown from 'markdown-to-jsx/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock, ArrowLeft, Eye, Heart, ExternalLink, Code2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

interface ModelSlugPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export const dynamicParams = true
export const revalidate = false

const fetchModelData = async (
  slug: string,
  locale: string
): Promise<{
  name: string
  provider: string
  title: string
  description: string
  fullText: string
  publishedAt: Date
  slug: string
  coverImageUrl?: string | null
  status: string
  contextWindow?: number | null
  maxOutputTokens?: number | null
  officialUrl?: string | null
  apiDocUrl?: string | null
  pricing?: string | null
  capabilities?: string | null
  views: number
  likes: number
}> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const response = await fetch(`${baseUrl}/api/models/${slug}?locale=${locale}`, {
    cache: 'force-cache'
  })

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch model data')
  }

  return response.json()
}

export async function generateMetadata(props: ModelSlugPageProps) {
  const { slug, locale } = await props.params
  const { title, description } = await fetchModelData(slug, locale)

  return {
    title,
    description
  }
}

const ModelSlugPage = async (props: ModelSlugPageProps) => {
  const { slug, locale } = await props.params
  const {
    fullText: content,
    publishedAt,
    title,
    name,
    provider,
    status,
    contextWindow,
    maxOutputTokens,
    officialUrl,
    apiDocUrl,
    pricing,
    capabilities,
    views,
    likes
  } = await fetchModelData(slug, locale)
  const t = await getTranslations('models')

  if (!content) {
    notFound()
  }

  // �����G����200W	
  const wordCount = content.length
  const readTime = Math.ceil(wordCount / 200)

  // ���~
  let capabilitiesArray: string[] = []
  if (capabilities) {
    try {
      capabilitiesArray = JSON.parse(capabilities)
    } catch {
      capabilitiesArray = []
    }
  }

  // �ֶ~7
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'beta':
        return 'secondary'
      case 'deprecated':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 mt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* ;��aG */}
        <article className="max-w-4xl mx-auto">
          <Card className="border-border/50 shadow-lg overflow-hidden">

            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
              {/* !�4��o */}
              <div className="mb-6 sm:mb-8">
                {/* � */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="hidden md:block text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                      {name}
                    </h1>

                    {/* ���� */}
                    <h1 className="md:hidden text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                      {name}
                    </h1>

                    <p className="text-muted-foreground text-sm sm:text-base">
                      {t('provider') || 'ЛF'}: <span className="font-medium text-foreground">{provider}</span>
                    </p>
                  </div>

                  <Badge variant={getStatusVariant(status)} className="capitalize">
                    {status}
                  </Badge>
                </div>

                {/* C�o */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(publishedAt)}</span>
                  </div>

                  {readTime > 0 && (
                    <>
                      <span className="text-border">"</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{t('readTime', { minutes: readTime }) || `${readTime} ��`}</span>
                      </div>
                    </>
                  )}

                  {views > 0 && (
                    <>
                      <span className="text-border">"</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        <span>{views.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  {likes > 0 && (
                    <>
                      <span className="text-border">"</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Heart className="h-4 w-4 text-primary" />
                        <span>{likes.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* !��<�o */}
                {(contextWindow || maxOutputTokens || capabilitiesArray.length > 0) && (
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-2">
                    {contextWindow && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{t('contextWindow') || ''}:</span>
                        <Badge variant="secondary">{contextWindow.toLocaleString()} tokens</Badge>
                      </div>
                    )}

                    {maxOutputTokens && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{t('maxOutputTokens') || ''}:</span>
                        <Badge variant="secondary">{maxOutputTokens.toLocaleString()} tokens</Badge>
                      </div>
                    )}

                    {capabilitiesArray.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{t('capabilities') || '��'}:</span>
                        {capabilitiesArray.map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ��� */}
                {(officialUrl || apiDocUrl) && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {officialUrl && (
                      <a
                        href={officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('officialWebsite') || '��Q�'}
                      </a>
                    )}

                    {apiDocUrl && (
                      <a
                        href={apiDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
                      >
                        <Code2 className="h-4 w-4" />
                        {t('apiDocumentation') || 'API �c'}
                      </a>
                    )}
                  </div>
                )}

                <Separator className="mt-6 sm:mt-8" />
              </div>

              {/* !��� */}
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
                <Markdown children={content} />
              </div>

              {/* ���o */}
              {pricing && (
                <>
                  <Separator className="mt-8 sm:mt-12" />
                  <div className="mt-6 sm:mt-8 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">{t('pricing') || '���o'}</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Markdown children={pricing} />
                    </div>
                  </div>
                </>
              )}

              {/* !���� */}
              <Separator className="mt-8 sm:mt-12" />

              {/* ���\: */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {t('publishedAt', { date: formatDate(publishedAt) })}
                </div>

                <Link href="/models">
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm">{t('backToModels') || '��!�h'}</span>
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

export default ModelSlugPage
