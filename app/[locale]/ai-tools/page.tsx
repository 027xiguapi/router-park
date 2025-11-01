"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { aiTools, categories } from "@/lib/ai-tools-data"
import { ToolCard } from "@/components/ai-tools/tool-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Grid3x3, MessageSquare, Code, Palette, Globe, FileText, Sparkles } from "lucide-react"

const iconMap = {
  Grid3x3,
  MessageSquare,
  Code,
  Palette,
  Globe,
  FileText,
  Sparkles,
}

export default function AIToolsPage() {
  const t = useTranslations("pages.aiTools")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // 过滤工具
  const filteredTools = useMemo(() => {
    return aiTools.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

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
          {categories.map((category) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap]
            const isActive = selectedCategory === category.id

            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={isActive ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
              >
                <Icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            )
          })}
        </div>

        {/* 工具网格 */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t('noResultsTitle')}</h3>
            <p className="text-muted-foreground">
              {t('noResultsDescription')}
            </p>
          </div>
        )}

        {/* 工具数量统计 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          {t('toolsCount', { count: aiTools.length })}
          {searchQuery || selectedCategory !== "all" ? t('showingCount', { count: filteredTools.length }) : ""}
        </div>
      </div>
    </div>
  )
}
