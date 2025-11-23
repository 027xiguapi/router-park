 'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code, Sparkles, Lock, LogIn, Brain } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'

export function FreeLLMAPI() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const { user, showLoginModal, status } = useUser()

  // 从数据库获取 LLM 密钥
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/freeKeys?type=llm&activeOnly=true')
        const data = await response.json()

        if (data.success && data.data) {
          // 解析密钥值数组
          const keys = JSON.parse(data.data.keyValues) as string[]
          setApiKeys(keys)
          // 设置最后更新时间
          const updateTime = new Date(data.data.updatedAt).toLocaleString('zh-CN')
          setLastUpdated(updateTime)
        } else {
          // 使用当前时间作为默认更新时间
          setLastUpdated(new Date().toLocaleString('zh-CN'))
        }
      } catch (error) {
        console.error('Error fetching API keys:', error)
        // 使用当前时间作为默认更新时间
        setLastUpdated(new Date().toLocaleString('zh-CN'))
      } finally {
        setLoading(false)
      }
    }
    fetchApiKeys()
  }, [])

  const models = [
    {
      name: "gpt-4.1-nano",
      description: "OpenAI 兼容接口",
      endpoint: "/v1/chat/completions",
      baseUrl: "https://cjack.routerpark.com",
      method: "POST",
      color: "blue"
    },
    {
      name: "gemini-2.5-flash-lite",
      description: "Google Gemini 兼容接口",
      endpoint: "/v1/chat/completions",
      baseUrl: "https://cjack.routerpark.com",
      method: "POST",
      color: "green"
    }
  ]

  // 遮罩 API Key 中间字符
  const maskApiKey = (key: string) => {
    if (key.length <= 20) return key
    const start = key.slice(0, 10)
    const end = key.slice(-10)
    const masked = '•'.repeat(key.length - 20)
    return `${start}${masked}${end}`
  }

  const handleCopyKey = async (key: string, index: number) => {
    if (!user) {
      toast.error('需要登录')
      return
    }
    try {
      await navigator.clipboard.writeText(key)
      setCopiedField(`key-${index}`)
      toast.success('API Key 复制成功')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const handleCopyExample = async (model: string) => {
    if (!user) {
      showLoginModal()
      return
    }

    const modelData = models.find(m => m.name === model)
    const exampleCode = `curl -X POST "${modelData?.baseUrl}${modelData?.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKeys[0]}" \\
  -d '{
    "model": "${model}",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "max_tokens": 100
  }'`

    try {
      await navigator.clipboard.writeText(exampleCode)
      setCopiedField(`example-${model}`)
      toast.success('示例代码复制成功')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 如果正在加载，显示加载状态
  if (status === 'loading' || loading) {
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

  return (
    <section id="free-llm-api" className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 mb-4">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">免费大模型</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              免费大模型 API 接口
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              提供 GPT-4.1-nano 和 Gemini-2.5-flash-lite 模型的免费 API 接口，完全兼容 OpenAI 格式
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

          {/* Models Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {models.map((model, index) => (
              <Card key={index} className="border-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">基础地址</span>
                      <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono">
                        {model.baseUrl}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">端点</span>
                      <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono">
                        {model.method} {model.endpoint}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyExample(model.name)}
                      className="w-full gap-2"
                    >
                      {copiedField === `example-${model.name}` ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          已复制示例代码
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4" />
                          复制示例代码
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* API Keys Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="py-8">
              {!user ? (
                // 未登录时显示登录提示
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">登录查看 API Keys</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      登录后可查看完整的 API 密钥，并复制使用
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
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold">可用的 API Keys</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      支持 gpt-4.1-nano 和 gemini-2.5-flash-lite 模型，点击复制按钮即可使用
                    </p>
                  </div>

                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {apiKeys.map((key, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono truncate">
                            {user ? key : maskApiKey(key)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key, index)}
                          className="flex-shrink-0"
                        >
                          {copiedField === `key-${index}` ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-center">
                  共 <span className="font-bold text-green-600 dark:text-green-400">{apiKeys.length}</span> 个可用密钥，支持 <span className="font-bold text-green-600 dark:text-green-400">2</span> 个模型，<span className="font-bold text-green-600 dark:text-green-400">{lastUpdated}</span> 更新
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Guide */}
          <div className="mt-8 p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              使用指南
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">基础使用</h5>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>复制任意一个 API Key</li>
                  <li>使用 OpenAI 兼容的客户端</li>
                  <li>设置正确的模型名称</li>
                  <li>发送请求到 /v1/chat/completions</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">支持的功能</h5>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>文本对话和生成</li>
                  <li>代码编写和解释</li>
                  <li>翻译和总结</li>
                  <li>创意写作</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">{apiKeys.length}</div>
              <div className="text-sm text-muted-foreground">可用密钥</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">{models.length}</div>
              <div className="text-sm text-muted-foreground">支持模型</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">免费使用</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}