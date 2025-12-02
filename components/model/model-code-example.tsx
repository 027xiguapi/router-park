'use client'

import { useState } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface ModelCodeExampleProps {
  modelSlug: string
  modelName: string
  baseUrl?: string
  endpoint?: string
  curlLabel?: string
  pythonLabel?: string
  jsLabel?: string
  copyLabel?: string
  copiedLabel?: string
  titleLabel?: string
}

export default function ModelCodeExample({
  modelSlug,
  modelName,
  baseUrl = 'https://routerpark.com',
  endpoint = '/v1/chat/completions',
  curlLabel = 'cURL',
  pythonLabel = 'Python',
  jsLabel = 'JavaScript',
  copyLabel = '复制代码',
  copiedLabel = '已复制',
  titleLabel = 'API 使用示例'
}: ModelCodeExampleProps) {
  const [selectedTab, setSelectedTab] = useState('curl')
  const [copied, setCopied] = useState(false)

  const apiKey = 'YOUR_API_KEY'

  // 生成不同语言的代码示例
  const getCodeExample = (lang: string) => {
    switch (lang) {
      case 'curl':
        return `curl -X POST "${baseUrl}${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${modelSlug}",
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
    "model": "${modelSlug}",
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
    model: "${modelSlug}",
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
    model: '${modelSlug}',
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

  const handleCopy = async () => {
    const code = getCodeExample(selectedTab)
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('代码已复制')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{titleLabel}</CardTitle>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">模型:</span>
            <code className="bg-secondary/50 px-2 py-0.5 rounded text-xs">{modelSlug}</code>
          </div>
          <span className="hidden sm:inline">·</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">Endpoint:</span>
            <code className="bg-secondary/50 px-2 py-0.5 rounded text-xs">{endpoint}</code>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="curl" className="flex-1 sm:flex-none text-xs sm:text-sm">
                {curlLabel}
              </TabsTrigger>
              <TabsTrigger value="python" className="flex-1 sm:flex-none text-xs sm:text-sm">
                {pythonLabel}
              </TabsTrigger>
              <TabsTrigger value="javascript" className="flex-1 sm:flex-none text-xs sm:text-sm">
                {jsLabel}
              </TabsTrigger>
              <TabsTrigger value="nodejs" className="flex-1 sm:flex-none text-xs sm:text-sm">
                Node.js
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs">{copiedLabel}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs">{copyLabel}</span>
                </>
              )}
            </Button>
          </div>

          <TabsContent value="curl" className="mt-0">
            <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
              <code className="text-foreground">{getCodeExample('curl')}</code>
            </pre>
          </TabsContent>
          <TabsContent value="python" className="mt-0">
            <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
              <code className="text-foreground">{getCodeExample('python')}</code>
            </pre>
          </TabsContent>
          <TabsContent value="javascript" className="mt-0">
            <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
              <code className="text-foreground">{getCodeExample('javascript')}</code>
            </pre>
          </TabsContent>
          <TabsContent value="nodejs" className="mt-0">
            <pre className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
              <code className="text-foreground">{getCodeExample('nodejs')}</code>
            </pre>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-blue-600 dark:text-blue-400">提示:</span> 将 <code className="bg-secondary/50 px-1 rounded">YOUR_API_KEY</code> 替换为你的实际 API Key。
            可在 <a href="/free-llm-api" className="text-primary hover:underline">免费 LLM API</a> 页面获取免费密钥。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
