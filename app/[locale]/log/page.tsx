import { getDailySummaryData, generateDailySummaryMarkdown } from '@/lib/daily-log'
import { getTranslations } from 'next-intl/server'
import {Metadata} from "next";
import {Card, CardContent} from "@/components/ui/card";
import {ArrowLeft} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {Link} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";
import MarkdownRender from "@/components/markdown/mark-down-render";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dailyLog')

  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  }
}

export default async function DailyLogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('dailyLog')

  const summaryData = await getDailySummaryData()
  const content = generateDailySummaryMarkdown(summaryData, locale, t)

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* 主内容卡片 */}
          <article className="max-w-4xl mx-auto">
            <Card className="border-border/50 shadow-lg overflow-hidden">

              <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
                {/* 文档头部信息 */}
                <div className="mb-6 sm:mb-8">
                  {/* 标题 */}
                  <h1 className="hidden md:block text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                    {t('metaTitle')}
                  </h1>

                  {/* 移动端标题 */}
                  <h1 className="md:hidden text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-tight">
                    {t('metaTitle')}
                  </h1>

                  <Separator className="mt-6 sm:mt-8" />
                </div>

                {/* 文档内容 */}
                <MarkdownRender content={content} />

                {/* 文档底部分隔 */}
                <Separator className="mt-8 sm:mt-12" />

                {/* 底部操作区 */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Link href="/config-guide">
                    <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm">{t('backToDocs') || '返回文档列表'}</span>
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
