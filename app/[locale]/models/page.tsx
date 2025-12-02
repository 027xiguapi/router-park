"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Brain, Sparkles, Eye, Heart, ExternalLink, Bot, Cpu, Globe, Building2 } from "lucide-react"
import { Link } from "@/i18n/navigation"

// 模型提供商配置
const providers = [
  { id: "all", name: "全部", icon: Globe },
  { id: "openai", name: "OpenAI", icon: Brain },
  { id: "anthropic", name: "Anthropic", icon: Bot },
  { id: "google", name: "Google", icon: Sparkles },
  { id: "meta", name: "Meta", icon: Building2 },
  { id: "mistral", name: "Mistral", icon: Cpu },
  { id: "alibaba", name: "阿里巴巴", icon: Building2 },
  { id: "baidu", name: "百度", icon: Building2 },
  { id: "other", name: "其他", icon: Globe },
]

// 模型类型定义
interface Model {
  id: string
  slug: string
  locale: string
  name: string
  provider: string
  coverImageUrl: string | null
  title: string
  description: string | null
  status: string
  views: number
  likes: number
  createdAt: string
  contextWindow?: number | null
  maxOutputTokens?: number | null
  capabilities?: string | null
}

export default function ModelsPage() {
  const t = useTranslations("modelsPage")
  const [selectedProvider, setSelectedProvider] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  // 获取模型数据
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models')
        if (response.ok) {
          const result = await response.json()
          // API 返回格式为 { success: true, data: [...] }
          if (result.success && result.data) {
            setModels(result.data)
          } else if (Array.isArray(result)) {
            // 兼容直接返回数组的情况
            setModels(result)
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  // 过滤模型
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesProvider = selectedProvider === "all" || model.provider === selectedProvider
      const matchesSearch =
        searchQuery === "" ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesProvider && matchesSearch
    })
  }, [selectedProvider, searchQuery, models])

  // 按提供商分组统计
  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = { all: models.length }
    models.forEach((model) => {
      counts[model.provider] = (counts[model.provider] || 0) + 1
    })
    return counts
  }, [models])

  // 获取状态样式
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

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // 解析能力标签
  const parseCapabilities = (capabilities: string | null | undefined): string[] => {
    if (!capabilities) return []
    try {
      return JSON.parse(capabilities)
    } catch {
      return []
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* 搜索框 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {providers.map((provider) => {
            const Icon = provider.icon
            const isActive = selectedProvider === provider.id
            const count = providerCounts[provider.id] || 0

            return (
              <Button
                key={provider.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProvider(provider.id)}
                className={isActive ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
              >
                <Icon className="mr-2 h-4 w-4" />
                {provider.name}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>

        {/* 加载状态 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredModels.length > 0 ? (
          <>
            {/* 模型网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredModels.map((model) => (
                <Link key={model.id} href={`/model/${model.slug}`}>
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 border-border/50 overflow-hidden group cursor-pointer">
                    <CardHeader className="space-y-3">
                      {/* 提供商和状态 */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {model.provider}
                        </Badge>
                        <Badge variant={getStatusVariant(model.status)} className="text-xs capitalize">
                          {model.status}
                        </Badge>
                      </div>

                      {/* 模型名称 */}
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {model.name}
                      </CardTitle>

                      {/* 描述 */}
                      {model.description && (
                        <CardDescription className="line-clamp-2 text-sm">
                          {model.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 能力标签 */}
                      {model.capabilities && (
                        <div className="flex flex-wrap gap-1">
                          {parseCapabilities(model.capabilities).slice(0, 3).map((capability, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {parseCapabilities(model.capabilities).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{parseCapabilities(model.capabilities).length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* 上下文窗口 */}
                      {model.contextWindow && (
                        <div className="text-xs text-muted-foreground">
                          {t('contextWindow')}: {formatNumber(model.contextWindow)} tokens
                        </div>
                      )}

                      {/* 统计信息 */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{formatNumber(model.views)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            <span>{formatNumber(model.likes)}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 统计 */}
            <div className="mt-12 text-center text-sm text-muted-foreground">
              {t('totalCount', { count: models.length })}
              {(searchQuery || selectedProvider !== "all") &&
                t('showingCount', { count: filteredModels.length })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t('noResultsTitle')}</h3>
            <p className="text-muted-foreground">
              {t('noResultsDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
