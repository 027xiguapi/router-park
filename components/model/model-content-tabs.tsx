'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, MessageSquare, Code } from 'lucide-react'
import MarkdownRender from '@/components/markdown/mark-down-render'
import ModelChat from '@/components/model/model-chat'
import ModelCodeExample from '@/components/model/model-code-example'
import Markdown from 'markdown-to-jsx/react'
import { Separator } from '@/components/ui/separator'

interface ModelContentTabsProps {
  content: string
  modelSlug: string
  modelName: string
  pricing?: string | null
  pricingLabel?: string
  introLabel?: string
  chatLabel?: string
  codeLabel?: string
}

export default function ModelContentTabs({
  content,
  modelSlug,
  modelName,
  pricing,
  pricingLabel = '定价信息',
  introLabel = '模型介绍',
  chatLabel = '在线体验',
  codeLabel = 'API 调用'
}: ModelContentTabsProps) {
  return (
    <Tabs defaultValue="intro" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="intro" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">{introLabel}</span>
          <span className="sm:hidden">介绍</span>
        </TabsTrigger>
        <TabsTrigger value="code" className="gap-2">
          <Code className="h-4 w-4" />
          <span className="hidden sm:inline">{codeLabel}</span>
          <span className="sm:hidden">API</span>
        </TabsTrigger>
        <TabsTrigger value="chat" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">{chatLabel}</span>
          <span className="sm:hidden">体验</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="intro" className="mt-0">
        <MarkdownRender content={content} />

        {/* 定价信息 */}
        {pricing && (
          <>
            <Separator className="mt-8 sm:mt-12" />
            <div className="mt-6 sm:mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">{pricingLabel}</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <Markdown children={pricing} />
              </div>
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="code" className="mt-0">
        <div className="space-y-6">
          <ModelCodeExample
            modelSlug={modelSlug}
            modelName={modelName}
            titleLabel="API 使用示例"
            copyLabel="复制代码"
            copiedLabel="已复制"
          />

          {/* 额外说明 */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-semibold">快速开始</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>获取 API Key: 访问 <a href="/free-llm-api" className="text-primary hover:underline">免费 LLM API</a> 页面获取</li>
              <li>选择编程语言: 支持 cURL、Python、JavaScript、Node.js 等</li>
              <li>复制示例代码: 点击上方的"复制代码"按钮</li>
              <li>替换 API Key: 将 YOUR_API_KEY 替换为你的实际密钥</li>
              <li>开始调用: 运行代码即可开始与模型对话</li>
            </ol>
          </div>

          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">注意事项</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>API 接口兼容 OpenAI 格式，可直接使用 OpenAI SDK</li>
              <li>请妥善保管你的 API Key，不要在公开场合泄露</li>
              <li>建议在服务端调用 API，避免在前端暴露密钥</li>
            </ul>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="chat" className="mt-0">
        <div className="min-h-[500px]">
          <ModelChat embedded />
        </div>
      </TabsContent>
    </Tabs>
  )
}
