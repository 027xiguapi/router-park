'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code, Image, Lock, LogIn, Palette, Cherry, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'
import { useTranslations } from 'next-intl'

export function FreeImageAPI() {
  const t = useTranslations('freeImageApi')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const { user, showLoginModal, status } = useUser()

  // 从数据库获取图片 API 密钥
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/freeKeys?type=image&activeOnly=true')
        const data = await response.json()

        if (data.success && data.data) {
          // 解析密钥值数组
          const keys = JSON.parse(data.data.keyValues) as string[]
          setApiKeys(keys)
          // 设置最后更新时间
          const updateTime = new Date(data.data.updatedAt).toLocaleString('zh-CN')
          setLastUpdated(updateTime)
        } else {
          // 如果数据库没有，使用默认密钥
          setApiKeys(['sk-CdgzCajJ0rLnOxFd627kAuDGSl9JqOkYEWfe29Lz0T6R77Co'])
          // 使用当前时间作为默认更新时间
          setLastUpdated(new Date().toLocaleString('zh-CN'))
        }
      } catch (error) {
        console.error('Error fetching API keys:', error)
        // 出错时使用默认密钥
        setApiKeys(['sk-CdgzCajJ0rLnOxFd627kAuDGSl9JqOkYEWfe29Lz0T6R77Co'])
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
      name: "lexica-v2",
      description: t('models.lexicaV2.description'),
      endpoint: "/v1/chat/completions",
      baseUrl: "https://lexica.routerpark.com",
      method: "POST",
      color: "purple"
    },
    {
      name: "lexica-aperture",
      description: t('models.lexicaAperture.description'),
      endpoint: "/v1/chat/completions",
      baseUrl: "https://lexica.routerpark.com",
      method: "POST",
      color: "pink"
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
    const exampleCode = `curl -X POST "${modelData?.baseUrl}${modelData?.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKeys[0]}" \\
  -d '{
    "model": "${model}",
    "messages": [
      {
        "role": "user",
        "content": "A beautiful sunset over the ocean, digital art"
      }
    ],
    "max_tokens": 100
  }'`

    try {
      await navigator.clipboard.writeText(exampleCode)
      setCopiedField(`example-${model}`)
      toast.success(t('toast.exampleCopied'))
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error(t('toast.copyFailed'))
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
      id: "router-park-free-image",
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
    <section id="free-image-api" className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 mb-4">
              <Palette className="h-4 w-4" />
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
                      <span className="text-sm text-muted-foreground">{t('baseUrl')}</span>
                      <code className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono">
                        {model.baseUrl}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('endpoint')}</span>
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
                          {t('exampleCopied')}
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4" />
                          {t('copyExample')}
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
                    <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Palette className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold">{t('availableKeys')}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {t('availableKeysDesc')}
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
                          onClick={() => handleImportToCherryStudio(key)}
                          className="flex-shrink-0"
                          title={t('importToCherry')}
                        >
                          <MessageSquare className="h-4 w-4 text-pink-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
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
                  <li>{t('features.textToImage')}</li>
                  <li>{t('features.styleTransfer')}</li>
                  <li>{t('features.artGeneration')}</li>
                  <li>{t('features.conceptDesign')}</li>
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
