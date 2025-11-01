"use client"

import { Card } from "@/components/ui/card"
import { Check, Copy, Terminal, ExternalLink, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from '@/i18n/navigation'

export default function ConfigGuidePage() {
  const t = useTranslations("pages.configGuide")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <Button variant="ghost" size="sm" className="mb-8" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToHome')}
          </Link>
        </Button>

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-foreground">{t('title')}</h1>
          <p className="text-lg text-gray-600 dark:text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {/* 步骤 1 */}
          <Card className="p-6">
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
                1️⃣
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-foreground">
                  {t('steps.step1.title')}
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  {t('steps.step1.description')}
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                  <ExternalLink className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {t('steps.step1.tip')}
                  </span>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/#monitor">{t('steps.step1.viewMonitorPanel')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* 步骤 2 */}
          <Card className="p-6">
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
                2️⃣
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-foreground">
                  {t('steps.step2.title')}
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  {t('steps.step2.description', { apiToken: 'API令牌' })}
                </p>
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('steps.step2.stepsTitle')}</p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>{t('steps.step2.steps.0', { addToken: '添加令牌' })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>{t('steps.step2.steps.1', { unlimitedQuota: '无限额度' })}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>{t('steps.step2.steps.2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>{t('steps.step2.steps.3', { codeSk: 'sk-' })}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                    <Terminal className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      {t('steps.step2.warning')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 步骤 3 */}
          <Card className="p-6">
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
                3️⃣
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-foreground">
                  {t('steps.step3.title')}
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  {t('steps.step3.description')}
                </p>

                <div className="space-y-4">
                  {/* 环境变量配置 */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('steps.step3.methods.method1.title')}
                    </p>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                        <code>{`# 设置 API Key
export OPENAI_API_KEY="sk-your-api-key"

# 设置 API 基址（以 anyrouter 为例）
export OPENAI_BASE_URL="https://anyrouter.top/v1"

# 验证配置
echo $OPENAI_API_KEY
echo $OPENAI_BASE_URL`}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-100"
                        onClick={() => handleCopy(`export OPENAI_API_KEY="sk-your-api-key"\nexport OPENAI_BASE_URL="https://anyrouter.top/v1"\necho $OPENAI_API_KEY\necho $OPENAI_BASE_URL`, 0)}
                      >
                        {copiedIndex === 0 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Python 配置 */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('steps.step3.methods.method2.title')}
                    </p>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                        <code>{`import openai

# 配置 API Key 和 Base URL
openai.api_key = "sk-your-api-key"
openai.api_base = "https://anyrouter.top/v1"

# 使用 API
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-100"
                        onClick={() => handleCopy(`import openai\n\nopenai.api_key = "sk-your-api-key"\nopenai.api_base = "https://anyrouter.top/v1"\n\nresponse = openai.ChatCompletion.create(\n    model="gpt-3.5-turbo",\n    messages=[{"role": "user", "content": "Hello!"}]\n)\nprint(response.choices[0].message.content)`, 1)}
                      >
                        {copiedIndex === 1 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Node.js 配置 */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('steps.step3.methods.method3.title')}
                    </p>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                        <code>{`const { Configuration, OpenAIApi } = require("openai");

// 配置 API Key 和 Base URL
const configuration = new Configuration({
  apiKey: "sk-your-api-key",
  basePath: "https://anyrouter.top/v1",
});

const openai = new OpenAIApi(configuration);

// 使用 API
async function chat() {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(response.data.choices[0].message.content);
}

chat();`}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-100"
                        onClick={() => handleCopy(`const { Configuration, OpenAIApi } = require("openai");\n\nconst configuration = new Configuration({\n  apiKey: "sk-your-api-key",\n  basePath: "https://anyrouter.top/v1",\n});\n\nconst openai = new OpenAIApi(configuration);\n\nasync function chat() {\n  const response = await openai.createChatCompletion({\n    model: "gpt-3.5-turbo",\n    messages: [{ role: "user", content: "Hello!" }],\n  });\n  console.log(response.data.choices[0].message.content);\n}\n\nchat();`, 2)}
                      >
                        {copiedIndex === 2 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* cURL 测试 */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('steps.step3.methods.method4.title')}
                    </p>
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                        <code>{`curl https://anyrouter.top/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-100"
                        onClick={() => handleCopy(`curl https://anyrouter.top/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer sk-your-api-key" \\\n  -d '{\n    "model": "gpt-3.5-turbo",\n    "messages": [\n      {"role": "user", "content": "Hello!"}\n    ]\n  }'`, 3)}
                      >
                        {copiedIndex === 3 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 步骤 4 */}
          <Card className="p-6">
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
                4️⃣
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-foreground">
                  {t('steps.step4.title')}
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  {t('steps.step4.description')}
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/20">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">
                      <p className="font-medium">{t('steps.step4.tipTitle')}</p>
                      <p>{t('steps.step4.tipDescription')}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('steps.step4.supportedModels')}</p>
                    <div className="flex flex-wrap gap-2">
                      {["GPT-4", "GPT-3.5-turbo", "Claude", "Gemini", "DALL-E", "Whisper"].map((model) => (
                        <span
                          key={model}
                          className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent dark:bg-accent/20"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 注意事项 */}
          <Card className="border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <Terminal className="mt-0.5 h-6 w-6 shrink-0 text-orange-600 dark:text-orange-400" />
              <div>
                <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">{t('notes.title')}</h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  {t.raw('notes.items').map((item: string, index: number) => {
                    const parts = item.split(/(\/v1|QQ 群)/);
                    return (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>
                          {parts.map((part, i) =>
                            part === '/v1' || part === 'QQ 群' ? (
                              <code key={i} className="rounded bg-blue-100 px-1.5 py-0.5 dark:bg-blue-900">{part}</code>
                            ) : (
                              part
                            )
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Card>

          {/* 底部返回按钮 */}
          <div className="flex justify-center pt-8">
            <Button asChild>
              <Link href="/">{t('backToHome')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
