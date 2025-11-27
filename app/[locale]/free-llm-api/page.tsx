'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code, Sparkles, Terminal, Zap, Shield, Cpu, Globe, Users, Star, MessageSquare, HelpCircle, ChevronDown, ChevronUp, Play, FileCode, Brain, Layers, Lock, LogIn, Award, TrendingUp, Rocket } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'
import {Link} from "@/i18n/navigation";

export default function FreeLLMAPIPage() {
  const t = useTranslations('freeLlmApi')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [apiKeys, setApiKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState<{ [key: string]: string }>({})
  const { user, showLoginModal, status } = useUser()

  const models = [
    {
      name: "gpt-4.1-nano",
      description: "轻量级 GPT-4 模型，响应快速，适合日常对话和代码辅助",
      endpoint: "/v1/chat/completions",
      baseUrl: "https://cjack.routerpark.com",
      method: "POST",
      color: "blue",
      features: ["高速响应", "低延迟", "通用任务"]
    },
    {
      name: "gemini-2.5-flash-lite",
      description: "Google Gemini 轻量版，擅长多语言理解和创意生成",
      endpoint: "/v1/chat/completions",
      baseUrl: "https://cjack.routerpark.com",
      method: "POST",
      color: "green",
      features: ["多语言", "创意写作", "快速生成"]
    }
  ]

  // 从数据库获取 LLM 密钥
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/freeKeys?type=llm&activeOnly=true')
        const data = await response.json()

        if (data.success && data.data) {
          const keys = JSON.parse(data.data.keyValues) as string[]
          setApiKeys(keys)
          const updateTime = new Date(data.data.updatedAt).toLocaleString('zh-CN')
          setLastUpdated(updateTime)
        } else {
          setLastUpdated(new Date().toLocaleString('zh-CN'))
        }
      } catch (error) {
        console.error('Error fetching API keys:', error)
        setLastUpdated(new Date().toLocaleString('zh-CN'))
      } finally {
        setLoading(false)
      }
    }
    fetchApiKeys()
  }, [])

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      toast.success('复制成功')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const handleCopyKey = async (key: string, index: number) => {
    if (!user) {
      toast.error('请先登录')
      return
    }
    try {
      await navigator.clipboard.writeText(key)
      setCopiedField(`key-${index}`)
      toast.success('API Key 已复制')
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
    const currentTab = selectedTab[model] || 'curl'
    const exampleCode = getCodeExample(model, modelData?.baseUrl || '', modelData?.endpoint || '', currentTab)

    try {
      await navigator.clipboard.writeText(exampleCode)
      setCopiedField(`example-${model}`)
      toast.success('示例代码已复制')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 生成不同语言的代码示例
  const getCodeExample = (model: string, baseUrl: string, endpoint: string, lang: string) => {
    const apiKey = apiKeys[0] || 'YOUR_API_KEY'

    switch (lang) {
      case 'curl':
        return `curl -X POST "${baseUrl}${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${model}",
    "messages": [
      {
        "role": "user",
        "content": "你好，请介绍一下自己"
      }
    ],
    "max_tokens": 500,
    "temperature": 0.7
  }'`
      case 'python':
        return `import requests

url = "${baseUrl}${endpoint}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
}
data = {
    "model": "${model}",
    "messages": [
        {"role": "user", "content": "你好，请介绍一下自己"}
    ],
    "max_tokens": 500,
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result['choices'][0]['message']['content'])`
      case 'javascript':
        return `const response = await fetch("${baseUrl}${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    model: "${model}",
    messages: [
      { role: "user", content: "你好，请介绍一下自己" }
    ],
    max_tokens: 500,
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
      default:
        return ''
    }
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  // 遮罩 API Key 中间字符
  const maskApiKey = (key: string) => {
    if (key.length <= 20) return key
    const start = key.slice(0, 10)
    const end = key.slice(-10)
    const masked = '•'.repeat(key.length - 20)
    return `${start}${masked}${end}`
  }

  // Hero Section
  const HeroSection = () => (
    <section className="py-20 bg-gradient-to-br from-green-500/5 via-background to-blue-500/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-6 animate-pulse">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">免费 LLM API · 多模型支持</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            免费大语言模型 API
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            体验 GPT-4、Gemini 等顶级 AI 模型，完全免费。OpenAI 兼容接口，无需信用卡，即刻开始构建智能应用。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play className="h-5 w-5" />
              立即获取 API
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              <FileCode className="h-5 w-5" />
              查看接入文档
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
              <div className="text-3xl font-bold text-primary mb-2">{models.length}+</div>
              <div className="text-sm text-muted-foreground">AI 模型</div>
            </div>
            <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
              <div className="text-3xl font-bold text-primary mb-2">20K+</div>
              <div className="text-sm text-muted-foreground">开发者使用</div>
            </div>
            <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">完全免费</div>
            </div>
            <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
              <div className="text-3xl font-bold text-primary mb-2">99.8%</div>
              <div className="text-sm text-muted-foreground">服务可用性</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  // Features Section
  const FeaturesSection = () => {
    const features = [
      {
        icon: <Brain className="h-8 w-8" />,
        title: '多模型支持',
        description: '支持 GPT-4、Gemini 等多个顶级大语言模型，满足不同场景需求，自由选择最适合的模型。'
      },
      {
        icon: <Layers className="h-8 w-8" />,
        title: 'OpenAI 兼容',
        description: '完全兼容 OpenAI API 格式，无需修改代码即可替换官方 API，降低接入成本。'
      },
      {
        icon: <Zap className="h-8 w-8" />,
        title: '极速响应',
        description: '优化的 API 网关和智能路由确保毫秒级响应，提供流畅的用户体验。'
      },
      {
        icon: <Shield className="h-8 w-8" />,
        title: '安全可靠',
        description: '企业级安全保障，数据加密传输，严格遵守隐私政策，保护你的应用和用户数据。'
      },
      {
        icon: <Globe className="h-8 w-8" />,
        title: '全球加速',
        description: '遍布全球的 CDN 节点和智能分流，无论用户在哪里都能享受最佳访问速度。'
      },
      {
        icon: <Code className="h-8 w-8" />,
        title: '丰富示例',
        description: '提供 Python、JavaScript、cURL 等多种语言示例，快速集成到你的项目中。'
      },
      {
        icon: <TrendingUp className="h-8 w-8" />,
        title: '高并发处理',
        description: '支持大规模并发请求，无论是个人项目还是企业应用都能稳定运行。'
      },
      {
        icon: <Award className="h-8 w-8" />,
        title: '专业支持',
        description: '活跃的开发者社区和技术支持团队，帮助你快速解决遇到的问题。'
      }
    ]

    return (
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">核心特性</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                为什么选择我们的 LLM API
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                我们提供企业级的免费 AI 模型访问服务，让你轻松构建智能应用
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                  <CardHeader>
                    <div className="mb-4 text-primary group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // How It Works Section
  const HowItWorksSection = () => {
    const steps = [
      {
        number: '01',
        title: '获取 API Key',
        description: '登录后即可获取免费的 API Key，无需信用卡验证，即刻开始使用。',
        icon: <Lock className="h-6 w-6" />
      },
      {
        number: '02',
        title: '选择模型',
        description: '根据你的需求选择合适的 AI 模型，支持 GPT-4、Gemini 等多个顶级模型。',
        icon: <Brain className="h-6 w-6" />
      },
      {
        number: '03',
        title: '集成到应用',
        description: '使用我们提供的代码示例，快速集成到你的应用中，支持多种编程语言。',
        icon: <Code className="h-6 w-6" />
      },
      {
        number: '04',
        title: '开始构建',
        description: '利用强大的 AI 能力，构建聊天机器人、内容生成、智能助手等创新应用。',
        icon: <Rocket className="h-6 w-6" />
      }
    ]

    return (
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Play className="h-4 w-4" />
                <span className="text-sm font-medium">接入指南</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                四步开始使用
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                简单快速的接入流程，从注册到调用只需几分钟
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="relative">
                    <div className="mb-4">
                      <div className="text-6xl font-bold text-primary/20 mb-2">{step.number}</div>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Models & API Keys Section
  const ModelsSection = () => (
    <section id="models" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">可用模型</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              支持的 AI 模型
            </h2>
            <p className="text-lg text-muted-foreground">
              多个顶级大语言模型，满足不同应用场景需求
            </p>
            {user ? (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                已登录：{user.email || user.name}
              </p>
            ) : (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                请登录以查看完整的 API Key
              </p>
            )}
          </div>

          {/* Models Info */}
          <div className="space-y-6 mb-8">
            {models.map((model, index) => (
              <Card key={index} className="border-2 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {model.features.map((feature, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm text-muted-foreground">Base URL</span>
                      <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono break-all">
                        {model.baseUrl}
                      </code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm text-muted-foreground">Endpoint</span>
                      <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono break-all">
                        {model.method} {model.endpoint}
                      </code>
                    </div>

                    {/* Code Examples Tabs */}
                    <div className="mt-4">
                      <Tabs
                        defaultValue="curl"
                        value={selectedTab[model.name] || 'curl'}
                        onValueChange={(value) => setSelectedTab(prev => ({ ...prev, [model.name]: value }))}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <TabsList className="w-full sm:w-auto">
                            <TabsTrigger value="curl" className="flex-1 sm:flex-none text-xs sm:text-sm">cURL</TabsTrigger>
                            <TabsTrigger value="python" className="flex-1 sm:flex-none text-xs sm:text-sm">Python</TabsTrigger>
                            <TabsTrigger value="javascript" className="flex-1 sm:flex-none text-xs sm:text-sm">JavaScript</TabsTrigger>
                          </TabsList>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyExample(model.name)}
                            className="gap-1 w-full sm:w-auto"
                          >
                            {copiedField === `example-${model.name}` ? (
                              <>
                                <Check className="h-3 w-3 text-green-500" />
                                <span className="text-xs">已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span className="text-xs">复制代码</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <TabsContent value="curl" className="mt-0">
                          <pre className="bg-secondary/50 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                            <code>{getCodeExample(model.name, model.baseUrl, model.endpoint, 'curl')}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="python" className="mt-0">
                          <pre className="bg-secondary/50 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                            <code>{getCodeExample(model.name, model.baseUrl, model.endpoint, 'python')}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="javascript" className="mt-0">
                          <pre className="bg-secondary/50 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                            <code>{getCodeExample(model.name, model.baseUrl, model.endpoint, 'javascript')}</code>
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* API Keys Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="py-8">
              {!user || status === 'loading' || loading ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">登录查看 API Keys</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      登录后即可获取免费的 API Key，开始构建你的 AI 应用
                    </p>
                  </div>
                  <Button size="lg" onClick={showLoginModal} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    立即登录
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    支持 GitHub、Google 等多种登录方式
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
                      以下是你可以使用的免费 API Keys，适用于所有支持的模型
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
                            {key}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key, index)}
                          className="flex-shrink-0"
                          title="复制 API Key"
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
                  当前提供 {apiKeys.length} 个免费 API Key，支持 {models.length} 个模型 · 最后更新：{lastUpdated}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">{apiKeys.length}</div>
              <div className="text-sm text-muted-foreground">可用 API Keys</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">{models.length}</div>
              <div className="text-sm text-muted-foreground">支持的模型</div>
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

  // Testimonials Section
  const TestimonialsSection = () => {
    const testimonials = [
      {
        name: '李明',
        role: 'AI 产品经理',
        company: '某创业公司',
        avatar: '👨‍💼',
        content: '免费的 LLM API 让我们的产品快速验证了 AI 功能。从接入到上线只用了两天，API 稳定性和响应速度都很出色。',
        rating: 5
      },
      {
        name: '王芳',
        role: 'Python 开发工程师',
        company: '网易',
        avatar: '👩‍💻',
        content: '之前用 OpenAI 官方 API 成本太高，切换到这个免费服务后，代码几乎不用改，但省下了大量费用。强烈推荐给独立开发者！',
        rating: 5
      },
      {
        name: '张伟',
        role: '全栈开发',
        company: '京东',
        avatar: '👨‍💻',
        content: '多模型支持非常棒！可以根据不同场景选择最合适的模型。GPT-4 用于复杂任务，Gemini 用于创意生成，完美组合。',
        rating: 5
      },
      {
        name: '刘静',
        role: '数据科学家',
        company: '百度',
        avatar: '👩‍🔬',
        content: 'API 文档清晰，代码示例丰富。作为数据科学家，我能快速将 AI 能力集成到数据分析流程中，大大提升了工作效率。',
        rating: 5
      },
      {
        name: '陈强',
        role: '独立开发者',
        company: '个人项目',
        avatar: '👨‍🎨',
        content: '作为独立开发者，这个免费 API 简直是福音。我用它开发了一个 AI 写作助手，用户反馈很好，完全没有成本压力。',
        rating: 5
      },
      {
        name: '赵敏',
        role: '前端工程师',
        company: '美团',
        avatar: '👩‍💼',
        content: 'OpenAI 兼容的接口设计太贴心了，我的 ChatBot 项目只需要改一行配置就完成了迁移。响应速度比官方 API 还快！',
        rating: 5
      }
    ]

    return (
      <section id="testimonials" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">用户评价</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                开发者怎么说
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                来自 20,000+ 开发者的真实反馈，看看他们如何使用我们的服务构建 AI 应用
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{testimonial.avatar}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                        <CardDescription className="text-xs">{testimonial.company}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // FAQ Section
  const FAQSection = () => {
    const faqs = [
      {
        question: '这个服务真的完全免费吗？',
        answer: '是的！我们提供的 LLM API 服务完全免费，无需信用卡，无隐藏费用。我们的目标是降低 AI 技术的使用门槛，让更多开发者能够轻松构建 AI 应用。'
      },
      {
        question: 'API 调用有限制吗？',
        answer: '我们为每个用户提供充足的 API 调用配额，对于大多数个人项目和中小型应用完全够用。如果你有更高的使用需求，我们也提供付费的企业级服务方案。'
      },
      {
        question: '支持哪些 AI 模型？',
        answer: '目前支持 GPT-4.1-nano、Gemini 2.5 Flash Lite 等多个顶级模型。我们会持续增加更多模型，包括 Claude、LLaMA 等。所有模型都通过统一的 OpenAI 兼容接口调用。'
      },
      {
        question: '如何保证 API 的稳定性？',
        answer: '我们在全球部署了多个 API 网关节点，并实现了智能负载均衡和故障转移。目前服务可用性达到 99.8%，平均响应时间在 100-500ms 之间。'
      },
      {
        question: '数据安全和隐私如何保障？',
        answer: '我们严格遵守数据隐私政策，所有 API 请求采用 HTTPS 加密传输。我们不会存储或分析你的请求内容，所有数据仅用于实时处理。'
      },
      {
        question: '可以用于商业项目吗？',
        answer: '可以！我们的免费 API 允许用于商业项目。对于大规模商业应用，我们建议升级到企业版以获得更高的配额和 SLA 保障。'
      },
      {
        question: '如何从 OpenAI 官方 API 迁移？',
        answer: '迁移非常简单！我们的 API 完全兼容 OpenAI 格式，你只需要修改 Base URL 和 API Key 即可。我们提供了详细的迁移指南和代码示例。'
      },
      {
        question: '遇到问题如何获取支持？',
        answer: '我们提供完善的文档和 FAQ。如有其他问题，可以通过 Discord 社区、GitHub Issues 或邮件联系我们。技术支持团队会在 24 小时内回复。'
      }
    ]

    return (
      <section id="faq" className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">常见问题</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                常见问题解答
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                这里收集了用户最关心的问题，帮助你快速了解我们的服务
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-secondary/20 transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg pr-8">{faq.question}</CardTitle>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedFaq === index && (
                    <CardContent className="pt-0 pb-6">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // CTA Section
  const CTASection = () => (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-2 border-primary/20 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">准备好开始了吗？</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              加入 20,000+ 开发者，立即体验免费的 LLM API。无需信用卡，几分钟即可开始构建你的 AI 应用。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })}>
                <Brain className="h-5 w-5" />
                获取免费 API
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Sparkles className="h-5 w-5" />
                返回顶部
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Link href="/config-guide">配置文档</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ModelsSection />
      <CTASection />
      <TestimonialsSection />
      <FAQSection />
    </div>
  )
}
