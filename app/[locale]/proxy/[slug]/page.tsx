import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/ui/button'
import Markdown from 'markdown-to-jsx/react'
import {ArrowLeft} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import { ProxyComments } from '@/components/proxy/proxy-comments'

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
  const { content } = await fetchProxyData(slug)
  const t = await getTranslations('proxy')
  const tComments = await getTranslations('comments')

  if (!content) {
    notFound()
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* 主内容卡片 */}
          <article className="max-w-4xl mx-auto">
            <Card className="border-border/50 shadow-lg overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
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

                <Separator className="mt-8 sm:mt-12" />

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Link href="/router-monitor">
                    <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm">{'Go Home'}</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 评论区 */}
            <ProxyComments slug={slug} />

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

export default ProxySlugPage
