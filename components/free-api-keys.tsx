'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code, Sparkles, Lock, LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'

export function FreeAPIKeys() {
  const t = useTranslations('freeApiKeys')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [keys, setKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const { user, showLoginModal, status } = useUser()

  const config = {
    ANTHROPIC_API_KEY: 'sk-gmoc2FR54apTAJkopcLPuy0MAifx0Z07HHsx16MvXvdFTGYm',
    ANTHROPIC_AUTH_TOKEN: 'sk-gmoc2FR54apTAJkopcLPuy0MAifx0Z07HHsx16MvXvdFTGYm',
    ANTHROPIC_BASE_URL: 'https://any.routerpark.com'
  }

  // 从数据库获取 Claude 密钥
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/freeKeys?type=claude&activeOnly=true')
        const data = await response.json()

        if (data.success && data.data) {
          // 解析密钥值数组
          const claudeKeys = JSON.parse(data.data.keyValues) as string[]
          setKeys(claudeKeys)
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
      toast.error(t('toast.loginRequired'))
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(key)
      toast.success(t('toast.copySuccess'))
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error(t('toast.copyFailed'))
    }
  }

  const handleCopyAll = async () => {
    if (!user) {
      toast.error(t('toast.loginToCopy'))
      return
    }
    const configText = `{
  "env": {
    "ANTHROPIC_API_KEY": "${config.ANTHROPIC_API_KEY}",
    "ANTHROPIC_AUTH_TOKEN": "${config.ANTHROPIC_AUTH_TOKEN}",
    "ANTHROPIC_BASE_URL": "${config.ANTHROPIC_BASE_URL}",
  }
}`
    try {
      await navigator.clipboard.writeText(configText)
      setCopiedField('all')
      toast.success(t('toast.copySuccess'))
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error(t('toast.copyFailed'))
    }
  }

  const handleCopyKey = async (key: string, index: number) => {
    if (!user) {
      toast.error(t('toast.loginRequired'))
      return
    }
    try {
      await navigator.clipboard.writeText(key)
      setCopiedField(`key-${index}`)
      toast.success(t('toast.copySuccess'))
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error(t('toast.copyFailed'))
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

  // 显示配置（所有用户可见）
  return (
    <section id="free-api-keys" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{t('freeUse')}</span>
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

          {/* Config Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <CardTitle>{t('envConfig')}</CardTitle>
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
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t('copyAll')}
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                {t('addToSettings')}
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
                <p className="text-sm font-medium mb-2">{t('copyIndividual')}</p>

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
                  {t('usageInstructions')}
                </h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>{t('instructions.step1')} <code className="bg-secondary px-1 rounded">.claude/config.json</code>)</li>
                  <li>{t('instructions.step2')}</li>
                  <li>{t('instructions.step3')}</li>
                  <li>{t('instructions.step4')}</li>
                </ol>
              </div>

              {/* Note */}
              <div className="text-xs text-muted-foreground text-center pt-2">
                {t('tip')}
              </div>
            </CardContent>
          </Card>

          {/* API Keys Card */}
          <Card className="mt-8 border-2 border-primary/20 shadow-lg">
            <CardContent className="py-8">
              {!user ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{t('loginRequired')}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {t('loginToView')}
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
                      <Sparkles className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold">{t('availableKeys')}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {t('availableKeysDesc')}
                    </p>
                  </div>

                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {keys.map((key, index) => (
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
                  {t('keysCount', { count: keys.length, date: lastUpdated })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">{t('stats.free')}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">{t('stats.available')}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="text-2xl font-bold text-primary mb-1">∞</div>
              <div className="text-sm text-muted-foreground">{t('stats.unlimited')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
