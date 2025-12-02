 'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code, Lock, LogIn, Brain, Cherry, ArrowRight, Terminal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Link } from '@/i18n/navigation'
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

interface ModelConfig {
  id: string
  name: string
  provider: string
  apiUrl: string
  models: string[]
  defaultModel?: string | null
  isActive: boolean
  priority: number
  description?: string | null
}

export function FreeLLMAPI() {
  const t = useTranslations('freeLlmApi')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [selectedCodeTab, setSelectedCodeTab] = useState('curl')
  const [codeCopied, setCodeCopied] = useState(false)
  const { user, showLoginModal, status } = useUser()

  // 生成代码示例
  const getCodeExample = (lang: string, apiKey: string = 'YOUR_API_KEY', modelName: string = 'gpt-4.1-nano') => {
    const baseUrl = 'https://routerpark.com'
    const endpoint = '/v1/chat/completions'

    switch (lang) {
      case 'curl':
        return `curl -X POST "${baseUrl}${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${modelName}",
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
    "model": "${modelName}",
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
    model: "${modelName}",
    messages: [
      { role: "user", content: "你好，请介绍一下自己" }
    ],
    max_tokens: 500,
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
      case 'nodejs':
        return `const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: '${apiKey}',
  baseURL: '${baseUrl}/v1'
});

async function main() {
  const completion = await client.chat.completions.create({
    model: '${modelName}',
    messages: [
      { role: 'user', content: '你好，请介绍一下自己' }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  console.log(completion.choices[0].message.content);
}

main();`
      default:
        return ''
    }
  }

  // 复制代码
  const handleCopyCode = async () => {
    const currentApiKey = apiKeys.length > 0 ? apiKeys[0].key : 'YOUR_API_KEY'
    const currentModel = models.length > 0 ? models[0].name : 'gpt-4.1-nano'
    const code = getCodeExample(selectedCodeTab, user ? currentApiKey : 'YOUR_API_KEY', currentModel)
    try {
      await navigator.clipboard.writeText(code)
      setCodeCopied(true)
      toast.success('代码已复制')
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  // 从数据库获取公开的 API 密钥和模型配置
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 并行获取 API 密钥和模型配置
        const [apiKeysResponse, modelConfigsResponse] = await Promise.all([
          fetch('/api/api-keys?publicOnly=true'),
          fetch('/api/model-configs')
        ])

        const apiKeysData = await apiKeysResponse.json()
        const modelConfigsData = await modelConfigsResponse.json()

        if (apiKeysData.success && apiKeysData.data && apiKeysData.data.length > 0) {
          setApiKeys(apiKeysData.data)
          // 设置最后更新时间（使用最新的密钥更新时间）
          const latestUpdate = new Date(apiKeysData.data[0].updatedAt).toLocaleString('zh-CN')
          setLastUpdated(latestUpdate)
        } else {
          // 使用当前时间作为默认更新时间
          setLastUpdated(new Date().toLocaleString('zh-CN'))
        }

        if (modelConfigsData.success && modelConfigsData.data) {
          setModelConfigs(modelConfigsData.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // 使用当前时间作为默认更新时间
        setLastUpdated(new Date().toLocaleString('zh-CN'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 从 modelConfigs 中提取所有支持的模型
  const models = modelConfigs.length > 0
    ? modelConfigs.flatMap((config) => {
        const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan']
        // 处理 apiUrl，移除末尾的 /v1 部分
        const baseUrl = config.apiUrl.replace(/\/v1\/?$/, '')
        return config.models.map((modelName, index) => ({
          name: modelName,
          description: config.description || t('models.default.description'),
          endpoint: '/v1/chat/completions',
          baseUrl: 'https://routerpark.com',
          method: 'POST',
          color: colors[index % colors.length],
          provider: config.provider
        }))
      })
    : [
        {
          name: 'gpt-4.1-nano',
          description: t('models.gpt4nano.description'),
          endpoint: '/v1/chat/completions',
          baseUrl: 'https://routerpark.com',
          method: 'POST',
          color: 'blue',
          provider: 'RouterPark'
        },
        {
          name: 'gemini-2.5-flash-lite',
          description: t('models.geminiFlash.description'),
          endpoint: '/v1/chat/completions',
          baseUrl: 'https://routerpark.com',
          method: 'POST',
          color: 'green',
          provider: 'RouterPark'
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
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 mb-4">
              <Brain className="h-4 w-4"/>
              <span className="text-sm font-medium">{t('freeModels')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('title')}
            </h2>
            {user ? (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  {t('loggedIn', {user: user.email || user.name})}
                </p>
            ) : (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  {t('notLoggedIn')}
                </p>
            )}
          </div>

          <div className="mb-12 w-full">
          <div className="flex items-center mb-6 md:mb-8 justify-center">
          <span className="semi-typography text-lg md:text-xl lg:text-2xl font-light semi-typography-tertiary semi-typography-normal">
          支持众多的大模型供应商
          </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto px-4">

        {/* MoonshotAI */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                fill="currentColor"
                fillRule="evenodd"
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>MoonshotAI</title>
              <path d="M1.052 16.916l9.539 2.552a21.007 21.007 0 00.06 2.033l5.956 1.593a11.997 11.997 0 01-5.586.865l-.18-.016-.044-.004-.084-.009-.094-.01a11.605 11.605 0 01-.157-.02l-.107-.014-.11-.016a11.962 11.962 0 01-.32-.051l-.042-.008-.075-.013-.107-.02-.07-.015-.093-.19-.075-.016-.095-.02-.097-.023-.094-.022-.068-.017-.088-.022-.09-.024-.095-.025-.082-.023-.109-.03-.062-.02-.084-.025-.093-.028-.105-.034-.058-.019-.08-.026-.09-.031-.066-.024a6.293 6.293 0 01-.044-.015l-.068-.025-.101-.037-.057-.022-.08-.03-.087-.035-.088-.035-.079-.032-.095-.04-.063-.028-.063-.027a5.655 5.655 0 01-.041-.018l-.066-.03-.103-.047-.052-.024-.096-.046-.062-.03-.084-.04-.086-.044-.093-.047-.052-.027-.103-.055-.057-.03-.058-.032a6.49 6.49 0 01-.046-.026l-.094-.053-.06-.034-.051-.03-.072-.041-.082-.05-.093-.056-.052-.032-.084-.053-.061-.039-.079-.05-.07-.047-.053-.035a7.785 7.785 0 01-.054-.036l-.044-.03-.044-.03a6.066 6.066 0 01-.04-.028l-.057-.04-.076-.054-.069-.05-.074-.054-.056-.042-.076-.057-.076-.059-.086-.067-.045-.035-.064-.052-.074-.06-.089-.073-.046-.039-.046-.039a7.516 7.516 0 01-.043-.037l-.045-.04-.061-.053-.07-.062-.068-.06-.062-.058-.067-.062-.053-.05-.088-.084a13.28 13.28 0 01-.099-.097l-.029-.028-.041-.042-.069-.07-.05-.051-.05-.053a6.457 6.457 0 01-.168-.179l-.08-.088-.062-.07-.071-.08-.042-.049-.053-.062-.058-.068-.046-.056a7.175 7.175 0 01-.027-.033l-.045-.055-.066-.082-.041-.052-.05-.064-.02-.025a11.99 11.99 0 01-1.44-2.402zm-1.02-5.794l11.353 3.037a20.468 20.468 0 00-.469 2.011l10.817 2.894a12.076 12.076 0 01-1.845 2.005L.657 15.923l-.016-.046-.035-.104a11.965 11.965 0 01-.05-.153l-.007-.023a11.896 11.896 0 01-.207-.741l-.03-.126-.018-.08-.021-.097-.018-.081-.018-.09-.017-.084-.018-.094c-.026-.141-.05-.283-.071-.426l-.017-.118-.011-.083-.013-.102a12.01 12.01 0 01-.019-.161l-.005-.047a12.12 12.12 0 01-.034-2.145zm1.593-5.15l11.948 3.196c-.368.605-.705 1.231-1.01 1.875l11.295 3.022c-.142.82-.368 1.612-.668 2.365l-11.55-3.09L.124 10.26l.015-.1.008-.049.01-.067.015-.087.018-.098c.026-.148.056-.295.088-.442l.028-.124.02-.085.024-.097c.022-.09.045-.18.07-.268l.028-.102.023-.083.03-.1.025-.082.03-.096.026-.082.031-.095a11.896 11.896 0 011.01-2.232zm4.442-4.4L17.352 4.59a20.77 20.77 0 00-1.688 1.721l7.823 2.093c.267.852.442 1.744.513 2.665L2.106 5.213l.045-.065.027-.04.04-.055.046-.065.055-.076.054-.072.064-.086.05-.065.057-.073.055-.07.06-.074.055-.069.065-.077.054-.066.066-.077.053-.06.072-.082.053-.06.067-.074.054-.058.073-.078.058-.06.063-.067.168-.17.1-.098.059-.056.076-.071a12.084 12.084 0 012.272-1.677zM12.017 0h.097l.082.001.069.001.054.002.068.002.046.001.076.003.047.002.06.003.054.002.087.005.105.007.144.011.088.007.044.004.077.008.082.008.047.005.102.012.05.006.108.014.081.01.042.006.065.01.207.032.07.012.065.011.14.026.092.018.11.022.046.01.075.016.041.01L14.7.3l.042.01.065.015.049.012.071.017.096.024.112.03.113.03.113.032.05.015.07.02.078.024.073.023.05.016.05.016.076.025.099.033.102.036.048.017.064.023.093.034.11.041.116.045.1.04.047.02.06.024.041.018.063.026.04.018.057.025.11.048.1.046.074.035.075.036.06.028.092.046.091.045.102.052.053.28.049.026.046.024.06.033.041.022.052.029.088.05.106.06.087.51.057.034.053.032.096.059.088.055.098.062.036.024.064.041.084.056.04.027.062.042.062.043.023.017c.054.037.108.075.161.114l.083.06.065.048.056.043.086.065.082.064.04.03.05.041.086.069.079.065.085.071c.712.6 1.353 1.283 1.909 2.031L7.222.994l.062-.027.065-.028.081-.034.086-.035c.113-.045.227-.09.341-.131l.096-.035.093-.033.084-.30.096-.031c.087-.30.176-.058.264-.085l.091-.027.086-.025.102-.30.085-.023.1-.026L9.04.37l.09-.023.091-.022.095-.022.09-.02.098-.021.091-.20.095-.018.092-.018.1-.018.091-.016.098-.017.092-.014.097-.015.092-.013.102-.013.091-.012.105-.012.09-.10.105-.01c.093-.10.186-.018.28-.024l.106-.008.09-.005.11-.006.093-.004.1-.004.097-.002.099-.002.197-.002z" />
            </svg>
          </div>

          {/* OpenAI */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                fill="currentColor"
                fillRule="evenodd"
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>OpenAI</title>
              <path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
            </svg>
          </div>

          {/* Grok */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                fill="currentColor"
                fillRule="evenodd"
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Grok</title>
              <path d="M6.469 8.776L16.512 23h-4.464L2.005 8.776H6.47zm-.004 7.9l2.233 3.164L6.467 23H2l4.465-6.324zM22 2.582V23h-3.659V7.764L22 2.582zM22 1l-9.952 14.095-2.233-3.163L17.533 1H22z" />
            </svg>
          </div>

          {/* Zhipu */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Zhipu</title>
              <path
                  d="M11.991 23.503a.24.24 0 00-.244.248.24.24 0 00.244.249.24.24 0 00.245-.249.24.24 0 00-.22-.247l-.025-.001zM9.671 5.365a1.697 1.697 0 011.099 2.132l-.071.172-.016.04-.018.054c-.07.16-.104.32-.104.498-.035.71.47 1.279 1.186 1.314h.366c1.309.053 2.338 1.173 2.286 2.523-.052 1.332-1.152 2.38-2.478 2.327h-.174c-.715.018-1.274.64-1.239 1.368 0 .124.018.23.053.337.209.373.54.658.96.8.75.23 1.517-.125 1.9-.782l.018-.035c.402-.64 1.17-.96 1.92-.711.854.284 1.378 1.226 1.099 2.167a1.661 1.661 0 01-2.077 1.102 1.711 1.711 0 01-.907-.711l-.017-.035c-.2-.323-.463-.58-.851-.711l-.056-.018a1.646 1.646 0 00-1.954.746 1.66 1.66 0 01-1.065.764 1.677 1.677 0 01-1.989-1.279c-.209-.906.332-1.83 1.257-2.043a1.51 1.51 0 01.296-.035h.018c.68-.071 1.151-.622 1.116-1.333a1.307 1.307 0 00-.227-.693 2.515 2.515 0 01-.366-1.403 2.39 2.39 0 01.366-1.208c.14-.195.21-.444.227-.693.018-.71-.506-1.261-1.186-1.332l-.07-.018a1.43 1.43 0 01-.299-.07l-.05-.019a1.7 1.7 0 01-1.047-2.114 1.68 1.68 0 012.094-1.101zm-5.575 10.11c.26-.264.639-.367.994-.27.355.096.633.379.728.74.095.362-.007.748-.267 1.013-.402.41-1.053.41-1.455 0a1.062 1.062 0 010-1.482zm14.845-.294c.359-.09.738.024.992.297.254.274.344.665.237 1.025-.107.36-.396.634-.756.718-.551.128-1.1-.22-1.23-.781a1.05 1.05 0 01.757-1.26zm-.064-4.39c.314.32.49.753.49 1.206 0 .452-.176.886-.49 1.206-.315.32-.74.5-1.185.5-.444 0-.87-.18-1.184-.5a1.727 1.727 0 010-2.412 1.654 1.654 0 012.369 0zm-11.243.163c.364.484.447 1.128.218 1.691a1.665 1.665 0 01-2.188.923c-.855-.36-1.26-1.358-.907-2.228a1.68 1.68 0 011.33-1.038c.593-.08 1.183.169 1.547.652zm11.545-4.221c.368 0 .708.2.892.524.184.324.184.724 0 1.048a1.026 1.026 0 01-.892.524c-.568 0-1.03-.47-1.03-1.048 0-.579.462-1.048 1.03-1.048zm-14.358 0c.368 0 .707.2.891.524.184.324.184.724 0 1.048a1.026 1.026 0 01-.891.524c-.569 0-1.03-.47-1.03-1.048 0-.579.461-1.048 1.03-1.048zm10.031-1.475c.925 0 1.675.764 1.675 1.706s-.75 1.705-1.675 1.705-1.674-.763-1.674-1.705c0-.942.75-1.706 1.674-1.706zm-2.626-.684c.362-.082.653-.356.761-.718a1.062 1.062 0 00-.238-1.028 1.017 1.017 0 00-.996-.294c-.547.14-.881.7-.752 1.257.13.558.675.907 1.225.783zm0 16.876c.359-.087.644-.36.75-.72a1.062 1.062 0 00-.237-1.019 1.018 1.018 0 00-.985-.301 1.037 1.037 0 00-.762.717c-.108.361-.017.754.239 1.028.245.263.606.377.953.305l.043-.01zM17.19 3.5a.631.631 0 00.628-.64c0-.355-.279-.64-.628-.64a.631.631 0 00-.628.64c0 .355.28.64.628.64zm-10.38 0a.631.631 0 00.628-.64c0-.355-.28-.64-.628-.64a.631.631 0 00-.628.64c0 .355.279.64.628.64zm-5.182 7.852a.631.631 0 00-.628.64c0 .354.28.639.628.639a.63.63 0 00.627-.606l.001-.034a.62.62 0 00-.628-.64zm5.182 9.13a.631.631 0 00-.628.64c0 .355.279.64.628.64a.631.631 0 00.628-.64c0-.355-.28-.64-.628-.64zm10.38.018a.631.631 0 00-.628.64c0 .355.28.64.628.64a.631.631 0 00.628-.64c0-.355-.279-.64-.628-.64zm5.182-9.148a.631.631 0 00-.628.64c0 .354.279.639.628.639a.631.631 0 00.628-.64c0-.355-.28-.64-.628-.64zm-.384-4.992a.24.24 0 00.244-.249.24.24 0 00-.244-.249.24.24 0 00-.244.249c0 .142.122.249.244.249zM11.991.497a.24.24 0 00.245-.248A.24.24 0 0011.99 0a.24.24 0 00-.244.249c0 .133.108.236.223.247l.021.001zM2.011 6.36a.24.24 0 00.245-.249.24.24 0 00-.244-.249.24.24 0 00-.244.249.24.24 0 00.244.249zm0 11.263a.24.24 0 00-.243.248.24.24 0 00.244.249.24.24 0 00.244-.249.252.252 0 00-.244-.248zm19.995-.018a.24.24 0 00-.245.248.24.24 0 00.245.25.24.24 0 00.244-.25.252.252 0 00-.244-.248z"
                  fill="#3859FF"
                  fillRule="nonzero"
              />
            </svg>
          </div>

          {/* Volcengine */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Volcengine</title>
              <path
                  d="M19.44 10.153l-2.936 11.586a.215.215 0 00.214.261h5.87a.215.215 0 00.214-.261l-2.95-11.586a.214.214 0 00-.412 0zM3.28 12.778l-2.275 8.96A.214.214 0 001.22 22h4.532a.212.212 0 00.214-.165.214.214 0 000-.097l-2.276-8.96a.214.214 0 00-.41 0z"
                  fill="#00E5E5"
              />
              <path
                  d="M7.29 5.359L3.148 21.738a.215.215 0 00.203.261h8.29a.214.214 0 00.215-.261L7.7 5.358a.214.214 0 00-.41 0z"
                  fill="#006EFF"
              />
              <path
                  d="M14.44.15a.214.214 0 00-.41 0L8.366 21.739a.214.214 0 00.214.261H19.9a.216.216 0 00.171-.078.214.214 0 00.044-.183L14.439.15z"
                  fill="#006EFF"
              />
              <path
                  d="M10.278 7.741L6.685 21.736a.214.214 0 00.214.264h7.17a.215.215 0 00.214-.264L10.688 7.741a.214.214 0 00-.41 0z"
                  fill="#00E5E5"
              />
            </svg>
          </div>

          {/* Cohere */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Cohere</title>
              <path
                  clipRule="evenodd"
                  d="M8.128 14.099c.592 0 1.77-.033 3.398-.703 1.897-.781 5.672-2.2 8.395-3.656 1.905-1.018 2.74-2.366 2.74-4.18A4.56 4.56 0 0018.1 1H7.549A6.55 6.55 0 001 7.55c0 3.617 2.745 6.549 7.128 6.549z"
                  fill="#39594D"
                  fillRule="evenodd"
              />
              <path
                  clipRule="evenodd"
                  d="M9.912 18.61a4.387 4.387 0 012.705-4.052l3.323-1.38c3.361-1.394 7.06 1.076 7.06 4.715a5.104 5.104 0 01-5.105 5.104l-3.597-.001a4.386 4.386 0 01-4.386-4.387z"
                  fill="#D18EE2"
                  fillRule="evenodd"
              />
              <path
                  d="M4.776 14.962A3.775 3.775 0 001 18.738v.489a3.776 3.776 0 007.551 0v-.49a3.775 3.775 0 00-3.775-3.775z"
                  fill="#FF7759"
              />
            </svg>
          </div>

          {/* Claude */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Claude</title>
              <path
                  d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
                  fill="#D97757"
                  fillRule="nonzero"
              />
            </svg>
          </div>

          {/* Gemini */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Gemini</title>
              <defs>
                <linearGradient id="lobe-icons-gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
                  <stop offset="0%" stopColor="#1C7DFF" />
                  <stop offset="52.021%" stopColor="#1C69FF" />
                  <stop offset="100%" stopColor="#F0DCD6" />
                </linearGradient>
              </defs>
              <path
                  d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
                  fill="url(#lobe-icons-gemini-fill)"
                  fillRule="nonzero"
              />
            </svg>
          </div>

          {/* Suno */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                fill="currentColor"
                fillRule="evenodd"
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Suno</title>
              <path d="M16.5 0C20.642 0 24 5.373 24 12h-9c0 6.627-3.358 12-7.5 12C3.358 24 0 18.627 0 12h9c0-6.627 3.358-12 7.5-12z" />
            </svg>
          </div>

          {/* Minimax */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Minimax</title>
              <defs>
                <linearGradient id="lobe-icons-minimax-fill" x1="0%" x2="100.182%" y1="50.057%" y2="50.057%">
                  <stop offset="0%" stopColor="#E2167E" />
                  <stop offset="100%" stopColor="#FE603C" />
                </linearGradient>
              </defs>
              <path
                  d="M16.278 2c1.156 0 2.093.927 2.093 2.07v12.501a.74.74 0 00.744.709.74.74 0 00.743-.709V9.099a2.06 2.06 0 012.071-2.049A2.06 2.06 0 0124 9.1v6.561a.649.649 0 01-.652.645.649.649 0 01-.653-.645V9.1a.762.762 0 00-.766-.758.762.762 0 00-.766.758v7.472a2.037 2.037 0 01-2.048 2.026 2.037 2.037 0 01-2.048-2.026v-12.5a.785.785 0 00-.788-.753.785.785 0 00-.789.752l-.001 15.904A2.037 2.037 0 0113.441 22a2.037 2.037 0 01-2.048-2.026V18.04c0-.356.292-.645.652-.645.36 0 .652.289.652.645v1.934c0 .263.142.506.372.638.23.131.514.131.744 0a.734.734 0 00.372-.638V4.07c0-1.143.937-2.07 2.093-2.07zm-5.674 0c1.156 0 2.093.927 2.093 2.07v11.523a.648.648 0 01-.652.645.648.648 0 01-.652-.645V4.07a.785.785 0 00-.789-.78.785.785 0 00-.789.78v14.013a2.06 2.06 0 01-2.07 2.048 2.06 2.06 0 01-2.071-2.048V9.1a.762.762 0 00-.766-.758.762.762 0 00-.766.758v3.8a2.06 2.06 0 01-2.071 2.049A2.06 2.06 0 010 12.9v-1.378c0-.357.292-.646.652-.646.36 0 .653.29.653.646V12.9c0 .418.343.757.766.757s.766-.339.766-.757V9.099a2.06 2.06 0 012.07-2.048 2.06 2.06 0 012.071 2.048v8.984c0 .419.343.758.767.758.423 0 .766-.339.766-.758V4.07c0-1.143.937-2.07 2.093-2.07z"
                  fill="url(#lobe-icons-minimax-fill)"
                  fillRule="nonzero"
              />
            </svg>
          </div>

          {/* Wenxin */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Wenxin</title>
              <defs>
                <linearGradient id="lobe-icons-wenxin-fill" x1="9.155%" x2="90.531%" y1="75.177%" y2="25.028%">
                  <stop offset="0%" stopColor="#0A51C3" />
                  <stop offset="100%" stopColor="#23A4FB" />
                </linearGradient>
              </defs>
              <g fill="none" fillRule="nonzero">
                <path
                    d="M11.32 1.176a1.4 1.4 0 011.36 0l8.64 4.843c.421.234.68.67.68 1.141v9.68c0 .472-.259.908-.68 1.143l-8.64 4.84a1.4 1.4 0 01-1.36 0l-8.64-4.84A1.31 1.31 0 012 16.84V7.159c0-.471.259-.907.68-1.142l8.64-4.84zm7.42 13.839V8.227L12.002 12 12 19.551l6.059-3.394a1.31 1.31 0 00.68-1.142zM12.68 4.833a1.393 1.393 0 00-1.36 0L5.944 7.846c-.421.235-.68.67-.68 1.142v6.027c0 .47.259.905.68 1.142l2.795 1.566V11.09a1.546 1.546 0 00.221.79 1.527 1.527 0 01-.216-.834l.004-.094.02-.15.018-.084.017-.062.039-.117.062-.142.035-.065.081-.13.094-.122.084-.091.08-.075.125-.1.071-.048.134-.076 5.87-3.29-2.796-1.566z"
                    fill="url(#lobe-icons-wenxin-fill)"
                />
                <path
                    d="M12 11.088c0-.875-.73-1.584-1.631-1.584a1.66 1.66 0 00-.855.237c-.027.016-.055.033-.08.05a2.361 2.361 0 00-.123.093c-.022.02-.045.038-.066.059l-.048.045-.063.067c-.014.016-.028.031-.04.048a2.303 2.303 0 00-.094.125l-.042.069a1.7 1.7 0 00-.07.13l-.036.081a.764.764 0 00-.022.06c-.01.03-.02.058-.028.087l-.017.062a.883.883 0 00-.03.16c-.002.025-.007.05-.008.74a1.527 1.527 0 00.213.929c.302.508.85.792 1.414.792.277 0 .558-.068.814-.212l.815-.457v-.914L12 11.088z"
                    fill="#012F8D"
                />
              </g>
            </svg>
          </div>

          {/* Spark */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Spark</title>
              <path
                  d="M2 13.08C2 9.182 4.772 6.367 9.32 2.122c-.65 7.883 6.41 8.272 5.023 12.214-.99 2.815-4.244 1.949-4.59 1.342 0 0 1.212.347 1.385-.866.174-1.213-2.252-1.862-3.81-4.937-2.6 2.988-.954 9.008 4.2 9.008 4.764 0 6.583-4.937 4.894-8.099 0 0 4.071.693 4.418 3.811.346 3.119-3.638 8.533-9.095 8.403C6.288 22.868 2 18.84 2 13.08z"
                  fill="#3DC8F9"
              />
              <path
                  d="M17.852 6.107L11.615 0c-.52 5.933.866 8.374 4.894 9.485 2.729.753 3.307 1.04 4.504 2.772-.338-2.407-.78-3.812-3.161-6.15z"
                  fill="#EA0100"
              />
              <path
                  clipRule="evenodd"
                  d="M9.033 18.323c.709.354 1.542.56 2.495.56 4.764 0 6.583-4.937 4.894-8.099 0 0 4.071.693 4.418 3.811.156 1.403-.565 3.27-1.902 4.89-3.458 1.57-7.29.84-9.905-1.162z"
                  fill="#1652D8"
                  fillRule="evenodd"
              />
            </svg>
          </div>

          {/* Qingyan */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Qingyan</title>
              <g fill="none" fillRule="evenodd">
                <path
                    d="M6.075 10.494C7.6 9.446 9.768 8.759 12.222 8.759c2.453 0 4.622.687 6.147 1.735.77.53 1.352 1.133 1.74 1.77C20 10 20 10 20.687 9.362a9.276 9.276 0 00-1.008-.8c-1.958-1.347-4.598-2.143-7.457-2.143-2.858 0-5.499.796-7.457 2.144-1.955 1.345-3.325 3.322-3.325 5.647 0 2.326 1.37 4.303 3.322 5.646C6.721 21.205 9.362 22 12.22 22c2.859 0 5.5-.795 7.457-2.144C21.63 18.513 23 16.538 23 14.21c0-1.48-.554-2.817-1.46-3.94-.046 1.036-.41 2.03-1.012 2.937.099.325.149.663.15 1.003 0 1.33-.782 2.664-2.313 3.717-1.524 1.048-3.692 1.735-6.146 1.735-2.453 0-4.623-.687-6.147-1.735C4.544 16.874 3.76 15.54 3.76 14.21c.003-1.33.785-2.663 2.315-3.716z"
                    fill="#3762FF"
                />
                <path
                    d="M3.747 11.494c-.62 1.77-.473 3.365.332 4.51.806 1.144 2.254 1.813 4.117 1.813 1.86 0 4.029-.68 6.021-2.1 1.993-1.42 3.35-3.251 3.967-5.017.62-1.769.473-3.364-.332-4.51-.806-1.143-2.254-1.812-4.117-1.812-1.86 0-4.029.68-6.021 2.099-1.993 1.42-3.35 3.252-3.967 5.017zm-2.228-.79c.8-2.28 2.487-4.498 4.83-6.167C8.691 2.866 11.33 2 13.734 2c2.4 0 4.678.874 6.045 2.817 1.366 1.943 1.431 4.394.633 6.674-.8 2.282-2.487 4.499-4.83 6.168-2.344 1.67-4.981 2.536-7.387 2.537-2.4 0-4.678-.874-6.045-2.817-1.368-1.943-1.431-4.396-.633-6.674h.002z"
                    fill="#1041F3"
                />
              </g>
            </svg>
          </div>

          {/* DeepSeek */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>DeepSeek</title>
              <path
                  d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"
                  fill="#4D6BFE"
              />
            </svg>
          </div>

          {/* Qwen */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Qwen</title>
              <defs>
                <linearGradient id="lobe-icons-qwen-fill" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#00055F" stopOpacity="0.84" />
                  <stop offset="100%" stopColor="#6F69F7" stopOpacity="0.84" />
                </linearGradient>
              </defs>
              <path
                  d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"
                  fill="url(#lobe-icons-qwen-fill)"
                  fillRule="nonzero"
              />
            </svg>
          </div>

          {/* Midjourney */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                fill="currentColor"
                fillRule="evenodd"
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Midjourney</title>
              <path d="M22.369 17.676c-1.387 1.259-3.17 2.378-5.332 3.417.044.03.086.057.13.083l.018.01.019.012c.216.123.42.184.641.184.222 0 .426-.061.642-.184l.018-.011.019-.011c.14-.084.266-.178.492-.366l.178-.148c.279-.232.426-.342.625-.456.304-.174.612-.266.949-.266.337 0 .645.092.949.266l.023.014c.188.109.334.219.602.442l.178.148c.221.184.346.278.483.36l.028.017.018.01c.21.12.407.181.62.185h.022a.31.31 0 110 .618c-.337 0-.645-.092-.95-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.02-.014a5.356 5.356 0 01-.49-.377l-.159-.132a3.836 3.836 0 00-.483-.36l-.027-.017-.019-.01a1.256 1.256 0 00-.641-.185c-.222 0-.426.061-.641.184l-.02.011-.018.011c-.14.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.51.39l-.022.014-.022.014-.09.054a1.868 1.868 0 01-.95.266c-.337 0-.644-.092-.949-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.026-.017a4.881 4.881 0 01-.425-.325.308.308 0 01-.12-.1l-.098-.081a3.836 3.836 0 00-.483-.36l-.027-.017-.019-.01a1.256 1.256 0 00-.641-.185c-.222 0-.426.061-.642.184l-.018.011-.019.011c-.14.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.51.39l-.023.014-.022.014-.09.054A1.868 1.868 0 0112 22c-.337 0-.645-.092-.949-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.021-.014a5.356 5.356 0 01-.49-.377l-.158-.132a3.836 3.836 0 00-.483-.36l-.028-.017-.018-.01a1.256 1.256 0 00-.642-.185c-.221 0-.425.061-.641.184l-.019.011-.018.011c-.141.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.511.39l-.022.014-.022.014-.09.054a1.868 1.868 0 01-.986.264c-.746-.09-1.319-.38-1.89-.866l-.035-.03c-.047-.041-.118-.106-.192-.174l-.196-.181-.107-.1-.011-.01a1.531 1.531 0 00-.336-.253.313.313 0 00-.095-.03h-.005c-.119.022-.238.059-.361.11a.308.308 0 01-.077.061l-.008.005a.309.309 0 01-.126.034 5.66 5.66 0 00-.774.518l-.416.324-.055.043a6.542 6.542 0 01-.324.236c-.305.207-.552.315-.8.315a.31.31 0 01-.01-.618h.01c.09 0 .235-.062.438-.198l.04-.027c.077-.054.163-.117.27-.199l.385-.301.06-.047c.268-.206.506-.373.73-.505l-.633-1.21a.309.309 0 01.254-.451l20.287-1.305a.309.309 0 01.228.537zm-1.118.14L2.369 19.03l.423.809c.128-.045.256-.078.388-.1a.31.31 0 01.052-.005c.132 0 .26.032.386.093.153.073.294.179.483.35l.016.015.092.086.144.134.097.089c.065.06.125.114.16.144.485.418.948.658 1.554.736h.011a1.25 1.25 0 00.6-.172l.021-.011.019-.011.018-.011c.141-.084.266-.178.492-.366l.178-.148c.279-.232.426-.342.625-.456.305-.174.612-.266.95-.266.336 0 .644.092.948.266l.023.014c.188.109.335.219.603.442l.177.148c.222.184.346.278.484.36l.027.017.019.01c.215.124.42.185.641.185.222 0 .426-.061.641-.184l.019-.011.018-.011c.141-.084.267-.178.493-.366l.177-.148c.28-.232.427-.342.626-.456.304-.174.612-.266.949-.266.337 0 .644.092.949.266l.025.015c.187.109.334.22.603.443 1.867-.878 3.448-1.811 4.73-2.832l.02-.016zM3.653 2.026C6.073 3.06 8.69 4.941 10.8 7.258c2.46 2.7 4.109 5.828 4.637 9.149a.31.31 0 01-.421.335c-2.348-.945-4.54-1.258-6.59-1.02-1.739.2-3.337.792-4.816 1.703-.294.182-.62-.182-.405-.454 1.856-2.355 2.581-4.99 2.343-7.794-.195-2.292-1.031-4.61-2.284-6.709a.31.31 0 01.388-.442zM10.04 4.45c1.778.543 3.892 2.102 5.782 4.243 1.984 2.248 3.552 4.934 4.347 7.582a.31.31 0 01-.401.38l-.022-.01-.386-.154a10.594 10.594 0 00-.291-.112l-.016-.006c-.68-.247-1.199-.291-1.944-.101a.31.31 0 01-.375-.218C15.378 11.123 13.073 7.276 9.775 5c-.291-.201-.072-.653.266-.55zM4.273 2.996l.008.015c1.028 1.94 1.708 4.031 1.885 6.113.213 2.513-.31 4.906-1.673 7.092l-.02.031.003-.001c1.198-.581 2.47-.969 3.825-1.132l.055-.006c1.981-.23 4.083.029 6.309.837l.066.025-.007-.039c-.593-2.95-2.108-5.737-4.31-8.179l-.07-.078c-1.785-1.96-3.944-3.6-6.014-4.65l-.057-.028zm7.92 3.238l.048.048c2.237 2.295 3.885 5.431 4.974 9.191l.038.132.022-.004c.71-.133 1.284-.063 1.963.18l.027.01.066.024.046.018-.025-.073c-.811-2.307-2.208-4.62-3.936-6.594l-.058-.065c-1.02-1.155-2.103-2.132-3.15-2.856l-.015-.011z" />
            </svg>
          </div>

          {/* Grok 2 */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                fill="currentColor"
                fillRule="evenodd"
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Grok</title>
              <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815" />
            </svg>
          </div>

          {/* AzureAI */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>AzureAI</title>
              <path
                  clipRule="evenodd"
                  d="M16.233 0c.713 0 1.345.551 1.572 1.329.227.778 1.555 5.59 1.555 5.59v9.562h-4.813L14.645 0h1.588z"
                  fill="url(#lobe-icons-azureai-fill-0)"
                  fillRule="evenodd"
              />
              <path
                  d="M23.298 7.47c0-.34-.275-.6-.6-.6h-2.835a3.617 3.617 0 00-3.614 3.615v5.996h3.436a3.617 3.617 0 003.613-3.614V7.47z"
                  fill="url(#lobe-icons-azureai-fill-1)"
              />
              <path
                  clipRule="evenodd"
                  d="M16.233 0a.982.982 0 00-.989.989l-.097 18.198A4.814 4.814 0 0110.334 24H1.6a.597.597 0 01-.567-.794l7-19.981A4.819 4.819 0 0112.57 0h3.679-.016z"
                  fill="url(#lobe-icons-azureai-fill-2)"
                  fillRule="evenodd"
              />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-azureai-fill-0" x1="18.242" x2="14.191" y1="16.837" y2="0.616">
                  <stop stopColor="#712575" />
                  <stop offset="0.09" stopColor="#9A2884" />
                  <stop offset="0.18" stopColor="#BF2C92" />
                  <stop offset="0.27" stopColor="#DA2E9C" />
                  <stop offset="0.34" stopColor="#EB30A2" />
                  <stop offset="0.4" stopColor="#F131A5" />
                  <stop offset="0.5" stopColor="#EC30A3" />
                  <stop offset="0.61" stopColor="#DF2F9E" />
                  <stop offset="0.72" stopColor="#C92D96" />
                  <stop offset="0.83" stopColor="#AA2A8A" />
                  <stop offset="0.95" stopColor="#83267C" />
                  <stop offset="1" stopColor="#712575" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-azureai-fill-1" x1="19.782" x2="19.782" y1="0.34" y2="23.222">
                  <stop stopColor="#DA7ED0" />
                  <stop offset="0.08" stopColor="#B17BD5" />
                  <stop offset="0.19" stopColor="#8778DB" />
                  <stop offset="0.3" stopColor="#6276E1" />
                  <stop offset="0.41" stopColor="#4574E5" />
                  <stop offset="0.54" stopColor="#2E72E8" />
                  <stop offset="0.67" stopColor="#1D71EB" />
                  <stop offset="0.81" stopColor="#1471EC" />
                  <stop offset="1" stopColor="#1171ED" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-azureai-fill-2" x1="18.404" x2="3.236" y1="0.859" y2="25.183">
                  <stop stopColor="#DA7ED0" />
                  <stop offset="0.05" stopColor="#B77BD4" />
                  <stop offset="0.11" stopColor="#9079DA" />
                  <stop offset="0.18" stopColor="#6E77DF" />
                  <stop offset="0.25" stopColor="#5175E3" />
                  <stop offset="0.33" stopColor="#3973E7" />
                  <stop offset="0.42" stopColor="#2772E9" />
                  <stop offset="0.54" stopColor="#1A71EB" />
                  <stop offset="0.68" stopColor="#1371EC" />
                  <stop offset="1" stopColor="#1171ED" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Hunyuan */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Hunyuan</title>
              <g fill="none" fillRule="evenodd">
                <circle cx="12" cy="12" fill="#0055E9" r="12" />
                <path
                    d="M12 0c.518 0 1.028.033 1.528.096A6.188 6.188 0 0112.12 12.28l-.12.001c-2.99 0-5.242 2.179-5.554 5.11-.223 2.086.353 4.412 2.242 6.146C3.672 22.1 0 17.479 0 12 0 5.373 5.373 0 12 0z"
                    fill="#A8DFF5"
                />
                <path
                    d="M5.286 5a2.438 2.438 0 01.682 3.38c-3.962 5.966-3.215 10.743 2.648 15.136C3.636 22.056 0 17.452 0 12c0-1.787.39-3.482 1.09-5.006.253-.435.525-.872.817-1.311A2.438 2.438 0 015.286 5z"
                    fill="#0055E9"
                />
                <path
                    d="M12.98.04c.272.021.543.053.81.093.583.106 1.117.254 1.538.44 6.638 2.927 8.07 10.052 1.748 15.642a4.125 4.125 0 01-5.822-.358c-1.51-1.706-1.3-4.184.357-5.822.858-.848 3.108-1.223 4.045-2.441 1.257-1.634 2.122-6.009-2.523-7.506L12.98.039z"
                    fill="#00BCFF"
                />
                <path
                    d="M13.528.096A6.187 6.187 0 0112 12.281a5.75 5.75 0 00-1.71.255c.147-.905.595-1.784 1.321-2.501.858-.848 3.108-1.223 4.045-2.441 1.27-1.651 2.14-6.104-2.676-7.554.184.014.367.033.548.056z"
                    fill="#ECECEE"
                />
              </g>
            </svg>
          </div>

          {/* Xinference */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
            <svg
                height="40"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flex: '0 0 auto', lineHeight: 1 }}
            >
              <title>Xinference</title>
              <path
                  d="M5.223 9.692c.652 1.795 1.925 3.376 3.396 4.573 1.482 1.229 3.254 2.17 5.122 2.653a9.99 9.99 0 002.033.302c1.302.05 2.713-.206 3.758-1.04 1.297-1.036 1.651-2.625 1.318-4.21-.209-.993-.641-1.93-1.205-2.787a10.284 10.284 0 00-.366-.525.008.008 0 01.005-.007h.004c.002 0 .004 0 .006.002l.394.405a17.227 17.227 0 012.484 3.262c.579.993 1.023 2.046 1.255 3.144.369 1.747.07 3.546-1.306 4.777-.724.648-1.655 1.041-2.59 1.235-1.297.267-2.649.228-3.965.007-.669-.112-1.315-.26-1.937-.443-2.576-.756-5.012-2.051-7.143-3.677a20.968 20.968 0 01-3.484-3.296C1.949 12.813 1.046 11.396.487 9.853.12 8.845-.087 7.725.035 6.663c.267-2.306 1.98-3.654 4.174-4.06 1.265-.234 2.594-.186 3.879.037a17.71 17.71 0 013.978 1.192v.004a.006.006 0 01-.004.004h-.004a8.907 8.907 0 00-2.869-.29c-.807.048-1.666.263-2.357.656-1.034.588-1.67 1.463-1.907 2.625a4.567 4.567 0 00-.069 1.1c.025.58.163 1.198.367 1.761z"
                  fill="url(#lobe-icons-xinference-fill-0)"
              />
              <path
                  d="M18.02 7.235a.05.05 0 01-.007.03c-.461.916-.923 1.832-1.386 2.747-.424.837-.745 1.437-.965 1.8a17.877 17.877 0 01-2.98 3.707.027.027 0 01-.03.005 12.678 12.678 0 01-4.205-2.777c-.14-.14-.28-.288-.42-.447a.024.024 0 01-.005-.013c0-.005 0-.01.003-.014a17.718 17.718 0 011.68-2.379 18.27 18.27 0 012.7-2.606c.408-.32 1.39-1.094 2.95-2.323L21.652.002a.008.008 0 01.01 0 .01.01 0 01.004.005.01.01 0 010 .006l-3.648 7.222z"
                  fill="url(#lobe-icons-xinference-fill-1)"
              />
              <path
                  d="M2.027 24c.002 0 .004 0 .005-.002l5.843-4.58a.02.02 0 00.008-.017.02.02 0 00-.01-.016 26.743 26.743 0 01-2.584-1.842h-.006a.014.014 0 00-.005.002.012.012 0 00-.004.005L2.02 23.987a.01.01 0 000 .006c0 .002 0 .004.002.005a.009.009 0 00.006.002z"
                  fill="url(#lobe-icons-xinference-fill-2)"
              />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-xinference-fill-0" x1="0.478" x2="22.985" y1="3.451" y2="19.698">
                  <stop stopColor="#6F11F4" />
                  <stop offset="1" stopColor="#AA66F1" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-xinference-fill-1" x1="21.676" x2="2.034" y1="0.006" y2="23.987">
                  <stop stopColor="#F52C77" />
                  <stop offset="1" stopColor="#E9A45F" stopOpacity="0.996" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="lobe-icons-xinference-fill-2" x1="21.676" x2="2.034" y1="0.006" y2="23.987">
                  <stop stopColor="#F52C77" />
                  <stop offset="1" stopColor="#E9A45F" stopOpacity="0.996" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 30+ */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
          <span className="semi-typography !text-lg sm:!text-xl md:!text-2xl lg:!text-3xl font-bold semi-typography-primary semi-typography-normal">
            30+
          </span>
          </div>
        </div>
      </div>


          {/* API Keys Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="py-8">
              {!user ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{t('loginToViewKeys')}</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        {t('loginToViewKeysDesc')}
                      </p>
                    </div>
                    <Button size="lg" onClick={showLoginModal} className="gap-2">
                      <LogIn className="h-4 w-4"/>
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
                        <Brain className="h-6 w-6 text-green-500"/>
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
                              <div
                                  className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
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
                                    <Check className="h-4 w-4 text-green-500"/>
                                ) : (
                                    <Copy className="h-4 w-4"/>
                                )}
                              </Button>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleImportToCherryStudio(apiKeyObj.key)}
                                  className="flex-shrink-0"
                                  title={t('importToCherry')}
                              >
                                <Cherry className="h-4 w-4 text-pink-500"/>
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
                                    style={{width: `${getUsagePercentage(apiKeyObj)}%`}}
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
                  {t('keysStats', {keyCount: apiKeys.length, modelCount: models.length, date: lastUpdated})}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Guide */}
          <div className="mt-8 p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500"/>
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

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/models">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Brain className="h-4 w-4" />
                查看所有模型
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Terminal className="h-4 w-4" />
                  查看代码示例
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    API 调用示例
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Base URL:</span>
                      <code className="bg-secondary/50 px-2 py-0.5 rounded text-xs">https://routerpark.com</code>
                    </div>
                    <span className="hidden sm:inline">·</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Endpoint:</span>
                      <code className="bg-secondary/50 px-2 py-0.5 rounded text-xs">/v1/chat/completions</code>
                    </div>
                  </div>

                  <Tabs value={selectedCodeTab} onValueChange={setSelectedCodeTab}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="curl" className="flex-1 sm:flex-none text-xs sm:text-sm">
                          cURL
                        </TabsTrigger>
                        <TabsTrigger value="python" className="flex-1 sm:flex-none text-xs sm:text-sm">
                          Python
                        </TabsTrigger>
                        <TabsTrigger value="javascript" className="flex-1 sm:flex-none text-xs sm:text-sm">
                          JavaScript
                        </TabsTrigger>
                        <TabsTrigger value="nodejs" className="flex-1 sm:flex-none text-xs sm:text-sm">
                          Node.js
                        </TabsTrigger>
                      </TabsList>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="gap-1.5 w-full sm:w-auto"
                      >
                        {codeCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-xs">复制代码</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <TabsContent value="curl" className="mt-0">
                      <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
                        <code className="text-foreground">
                          {getCodeExample('curl', user && apiKeys.length > 0 ? apiKeys[0].key : 'YOUR_API_KEY', models.length > 0 ? models[0].name : 'gpt-4.1-nano')}
                        </code>
                      </pre>
                    </TabsContent>
                    <TabsContent value="python" className="mt-0">
                      <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
                        <code className="text-foreground">
                          {getCodeExample('python', user && apiKeys.length > 0 ? apiKeys[0].key : 'YOUR_API_KEY', models.length > 0 ? models[0].name : 'gpt-4.1-nano')}
                        </code>
                      </pre>
                    </TabsContent>
                    <TabsContent value="javascript" className="mt-0">
                      <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
                        <code className="text-foreground">
                          {getCodeExample('javascript', user && apiKeys.length > 0 ? apiKeys[0].key : 'YOUR_API_KEY', models.length > 0 ? models[0].name : 'gpt-4.1-nano')}
                        </code>
                      </pre>
                    </TabsContent>
                    <TabsContent value="nodejs" className="mt-0">
                      <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
                        <code className="text-foreground">
                          {getCodeExample('nodejs', user && apiKeys.length > 0 ? apiKeys[0].key : 'YOUR_API_KEY', models.length > 0 ? models[0].name : 'gpt-4.1-nano')}
                        </code>
                      </pre>
                    </TabsContent>
                  </Tabs>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-blue-600 dark:text-blue-400">提示:</span>
                      {user ? ' 代码中已填入您的 API Key，可直接使用。' : ' 请先登录以获取您的 API Key，或将 YOUR_API_KEY 替换为实际密钥。'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2 text-sm">注意事项</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      <li>API 接口兼容 OpenAI 格式，可直接使用 OpenAI SDK</li>
                      <li>请妥善保管你的 API Key，不要在公开场合泄露</li>
                      <li>建议在服务端调用 API，避免在前端暴露密钥</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  )
}