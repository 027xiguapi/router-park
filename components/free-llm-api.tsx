 'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code, Sparkles, Lock, LogIn, Brain, Cherry, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'
import { useTranslations } from 'next-intl'

interface ApiKey {
  id: string
  key: string
  name: string
  status: string
  quota: number
  usedQuota: number
  unlimitedQuota: boolean
  updatedAt: string
}

export function FreeLLMAPI() {
  const t = useTranslations('freeLlmApi')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState<{ [key: string]: string }>({})
  const { user, showLoginModal, status } = useUser()

  // 从数据库获取公开的 API 密钥
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/api-keys?publicOnly=true')
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          setApiKeys(data.data)
          // 设置最后更新时间（使用最新的密钥更新时间）
          const latestUpdate = new Date(data.data[0].updatedAt).toLocaleString('zh-CN')
          setLastUpdated(latestUpdate)
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
      description: t('models.gpt4nano.description'),
      endpoint: "/v1/chat/completions",
      baseUrl: "https://routerpark.com",
      method: "POST",
      color: "blue"
    },
    {
      name: "gemini-2.5-flash-lite",
      description: t('models.geminiFlash.description'),
      endpoint: "/v1/chat/completions",
      baseUrl: "https://routerpark.com",
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
      toast.error(t('toast.loginRequired'))
      return
    }
    try {
      await navigator.clipboard.writeText(key)
      setCopiedField(`key-${index}`)
      toast.success(t('toast.apiKeyCopied'))
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error(t('toast.copyFailed'))
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
      toast.success(t('toast.exampleCopied'))
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error(t('toast.copyFailed'))
    }
  }

  // 生成不同语言的代码示例
  const getCodeExample = (model: string, baseUrl: string, endpoint: string, lang: string) => {
    const apiKey = apiKeys.length > 0 ? apiKeys[0].key : 'YOUR_API_KEY'

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
        "content": "Hello, how are you?"
      }
    ],
    "max_tokens": 100
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
        {"role": "user", "content": "Hello, how are you?"}
    ],
    "max_tokens": 100
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`
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
      { role: "user", content: "Hello, how are you?" }
    ],
    max_tokens: 100
  })
});

const data = await response.json();
console.log(data);`
      default:
        return ''
    }
  }

  const handleImportToCherryStudio = (apiKey: string) => {
    if (!user) {
      showLoginModal()
      return
    }

    if (!apiKey) {
      toast.error(t('toast.apiKeyUnavailable'))
      return
    }

    const cherryConfig = {
      id: "router-park-free-llm",
      baseUrl: models[0].baseUrl,
      apiKey: apiKey
    }

    // 将配置转换为 JSON，然后 Base64 编码
    const configJson = JSON.stringify(cherryConfig)
    const base64Data = btoa(configJson)

    const cherryUrl = `cherrystudio://providers/api-keys?v=1&data=${encodeURIComponent(base64Data)}`

    window.location.href = cherryUrl

    toast.success(t('launchingCherry'))
  }

  // 计算使用百分比
  const getUsagePercentage = (apiKey: ApiKey) => {
    if (apiKey.unlimitedQuota) {
      return 100 // 无限额度显示为 0%
    }
    if (apiKey.quota === 0) {
      return 100
    }
    return Math.min(100, Math.round((apiKey.usedQuota / apiKey.quota) * 100))
  }

  // 格式化额度显示
  const formatQuota = (quota: number) => {
    if (quota >= 1000000) {
      return `${(quota / 1000000).toFixed(1)}M`
    }
    if (quota >= 1000) {
      return `${(quota / 1000).toFixed(1)}K`
    }
    return quota.toString()
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
              <span className="text-sm font-medium">{t('freeModels')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('description')}
            </p>
            {user ? (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                {t('loggedIn', { user: user.email || user.name })}
              </p>
            ) : (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                {t('notLoggedIn')}
              </p>
            )}
          </div>

          {/* Models Info */}
          <div className="mb-8">
            {models.map((model, index) => (
              <Card key={index} className="border-2 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm text-muted-foreground">{t('baseUrl')}</span>
                      <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono break-all">
                        {model.baseUrl}
                      </code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm text-muted-foreground">{t('endpoint')}</span>
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
                            <TabsTrigger value="javascript" className="flex-1 sm:flex-none text-xs sm:text-sm">JS</TabsTrigger>
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
                                <span className="text-xs">{t('exampleCopied')}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span className="text-xs">{t('copyExample')}</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <TabsContent value="curl" className="mt-0">
                          <pre className="bg-secondary/50 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                            <code>{getCodeExample(model.name, model.baseUrl, model.endpoint, 'curl')}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="python" className="mt-0">
                          <pre className="bg-secondary/50 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                            <code>{getCodeExample(model.name, model.baseUrl, model.endpoint, 'python')}</code>
                          </pre>
                        </TabsContent>
                        <TabsContent value="javascript" className="mt-0">
                          <pre className="bg-secondary/50 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
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
              {!user ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{t('loginToViewKeys')}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {t('loginToViewKeysDesc')}
                    </p>
                  </div>
                  <Button size="lg" onClick={showLoginModal} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('loginNow')}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t('loginSupport')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold">{t('availableKeys')}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {t('availableKeysDesc')}
                    </p>
                  </div>

                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {apiKeys.map((apiKeyObj, index) => (
                      <div
                        key={apiKeyObj.id}
                        className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-mono truncate">
                              {user ? apiKeyObj.key : maskApiKey(apiKeyObj.key)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyKey(apiKeyObj.key, index)}
                            className="flex-shrink-0"
                            title={t('copyApiKey')}
                          >
                            {copiedField === `key-${index}` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleImportToCherryStudio(apiKeyObj.key)}
                            className="flex-shrink-0"
                            title={t('importToCherry')}
                          >
                            <Cherry className="h-4 w-4 text-pink-500" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              剩余额度
                            </span>
                            <span className="font-medium">
                              {formatQuota(apiKeyObj.quota - apiKeyObj.usedQuota)} / {formatQuota(apiKeyObj.quota)}
                              <span className="text-muted-foreground ml-1">
                                (剩余 {100 - getUsagePercentage(apiKeyObj)}%)
                              </span>
                            </span>
                          </div>
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary transition-all duration-300 ease-in-out"
                              style={{ width: `${getUsagePercentage(apiKeyObj)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-center">
                  {t('keysStats', { keyCount: apiKeys.length, modelCount: 2, date: lastUpdated })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Guide */}
          <div className="mt-8 p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              {t('usageGuide')}
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">{t('basicUsage')}</h5>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t('basicUsageSteps.step1')}</li>
                  <li>{t('basicUsageSteps.step2')}</li>
                  <li>{t('basicUsageSteps.step3')}</li>
                  <li>{t('basicUsageSteps.step4')}</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">{t('supportedFeatures')}</h5>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t('features.chat')}</li>
                  <li>{t('features.code')}</li>
                  <li>{t('features.translate')}</li>
                  <li>{t('features.creative')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">{apiKeys.length}</div>
              <div className="text-sm text-muted-foreground">{t('stats.availableKeys')}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">{models.length}</div>
              <div className="text-sm text-muted-foreground">{t('stats.supportedModels')}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">{t('stats.freeUsage')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}