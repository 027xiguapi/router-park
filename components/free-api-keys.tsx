'use client'

import { useState } from 'react'
import { Copy, Check, Code, Sparkles, Lock, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'

export function FreeAPIKeys() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { user, showLoginModal, status } = useUser()

  const config = {
    ANTHROPIC_API_KEY: 'sk-gmoc2FR54apTAJkopcLPuy0MAifx0Z07HHsx16MvXvdFTGYm',
    ANTHROPIC_AUTH_TOKEN: 'sk-gmoc2FR54apTAJkopcLPuy0MAifx0Z07HHsx16MvXvdFTGYm',
    ANTHROPIC_BASE_URL: 'https://any.routerpark.com'
  }

  // 遮罩 API Key 中间字符
  const maskApiKey = (key: string) => {
    if (key.length <= 20) return key
    const start = key.slice(0, 10)
    const end = key.slice(-10)
    const masked = '•'.repeat(key.length - 20)
    return `${start}${masked}${end}`
  }

  // 根据登录状态返回显示的配置
  const getDisplayConfig = () => {
    if (user) {
      return config
    }
    return {
      ANTHROPIC_API_KEY: maskApiKey(config.ANTHROPIC_API_KEY),
      ANTHROPIC_AUTH_TOKEN: maskApiKey(config.ANTHROPIC_AUTH_TOKEN),
      ANTHROPIC_BASE_URL: config.ANTHROPIC_BASE_URL
    }
  }

  const displayConfig = getDisplayConfig()

  const handleCopy = async (key: string, value: string) => {
    if (!user) {
      toast.error('需要登录')
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(key)
      toast.success( '复制成功')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const handleCopyAll = async () => {
    if (!user) {
      toast.error('请先登录后才能复制配置')
      return
    }
    const configText = `{
  "env": {
    "ANTHROPIC_API_KEY": "${config.ANTHROPIC_API_KEY}",
    "ANTHROPIC_AUTH_TOKEN": "${config.ANTHROPIC_AUTH_TOKEN}",
    "ANTHROPIC_BASE_URL": "${config.ANTHROPIC_BASE_URL}"
  }
}`
    try {
      await navigator.clipboard.writeText(configText)
      setCopiedField('all')
      toast.success('复制成功')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 如果正在加载，显示加载状态
  if (status === 'loading') {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-secondary rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-secondary rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 显示配置（所有用户可见）
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">免费使用</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              免费 Claude Code 和 Codex 配置
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              立即开始使用 Claude Code 和 Codex，无需付费订阅。复制以下配置到你的 Claude Code 设置中即可使用。
            </p>
            {user ? (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✓ 已登录：{user.email || user.name}
              </p>
            ) : (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                ⚠ 未登录：API 密钥已部分隐藏，登录后查看完整配置
              </p>
            )}
          </div>

          {/* Config Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <CardTitle>环境配置</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  className="gap-2"
                >
                  {copiedField === 'all' ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      复制全部
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                将以下配置添加到 Claude Code 的设置文件中
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Code Block */}
              <div className="relative">
                <pre
                  className={`bg-secondary/50 rounded-lg p-4 overflow-x-auto border ${!user ? 'select-none' : ''}`}
                  style={!user ? { userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' } : {}}
                >
                  <code className="text-sm font-mono">
{`{
  "env": {
    "ANTHROPIC_API_KEY": "${displayConfig.ANTHROPIC_API_KEY}",
    "ANTHROPIC_AUTH_TOKEN": "${displayConfig.ANTHROPIC_AUTH_TOKEN}",
    "ANTHROPIC_BASE_URL": "${displayConfig.ANTHROPIC_BASE_URL}"
  }
}`}
                  </code>
                </pre>
              </div>

              {/* Individual Fields */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium mb-2">单独复制各项配置：</p>

                {Object.entries(displayConfig).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors ${!user ? 'select-none' : ''}`}
                    style={!user ? { userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' } : {}}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {key}
                      </div>
                      <div className="text-sm font-mono truncate">
                        {value}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(key, config[key as keyof typeof config])}
                      className="flex-shrink-0"
                      disabled={!user}
                    >
                      {copiedField === key ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Usage Instructions */}
              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  使用说明
                </h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>打开 Claude Code 设置（通常是 <code className="bg-secondary px-1 rounded">.claude/config.json</code>）</li>
                  <li>将上述配置粘贴到配置文件中</li>
                  <li>保存文件并重启 Claude Code</li>
                  <li>开始免费使用 Claude Code！</li>
                </ol>
              </div>

              {/* Note */}
              <div className="text-xs text-muted-foreground text-center pt-2">
                💡 提示：此配置使用我们的免费��理服务器，可能会有速率限制
              </div>
            </CardContent>
          </Card>

          {/* Login Prompt for Unauthenticated Users */}
          {!user && (
            <Card className="mt-8 border-2 border-primary/20 shadow-lg">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">登录查看完整配置</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      登录后可查看完整的 API 密钥，并复制配置到你的 Claude Code 设置中
                    </p>
                  </div>
                  <Button size="lg" onClick={showLoginModal} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    立即登录
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    支持 Google 和 GitHub 登录
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">完全免费</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">全天候可用</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">∞</div>
              <div className="text-sm text-muted-foreground">无限使用</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
