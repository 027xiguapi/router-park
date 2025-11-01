"use client"

import { Card } from "@/components/ui/card"
import { Check, Copy, Terminal, ExternalLink, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"

export default function ConfigGuidePage() {
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
            返回首页
          </Link>
        </Button>

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-foreground">配置指南</h1>
          <p className="text-lg text-gray-600 dark:text-muted-foreground">
            只需简单配置，即可使用 AI 接口中转服务
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
                  选择中转服务商并注册
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  从首页监控面板中选择一个在线的服务商，点击邀请链接注册账号
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                  <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    建议选择在线状态且响应时间较低的服务商
                  </span>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/#monitor">查看监控面板</Link>
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
                  获取 API Key
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  注册并登录后，在服务商后台的 <strong>API令牌</strong> 页面获取你的 API Key
                </p>
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">获取步骤：</p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>点击 <strong>添加令牌</strong> 按钮</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>名称随意填写，额度建议设为 <strong>无限额度</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>其他选项保持默认设置即可</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-accent">▸</span>
                        <span>获得的 API Key 以 <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-800">sk-</code> 开头</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                    <Terminal className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      请妥善保管你的 API Key，不要泄露给他人
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
                  配置环境变量
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  在您的项目中配置 API Key 和 Base URL
                </p>

                <div className="space-y-4">
                  {/* 环境变量配置 */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      方式一：使用环境变量（推荐）
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
                      方式二：在代码中配置（Python）
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
                      方式三：在代码中配置（Node.js）
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
                      方式四：使用 cURL 测试
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
                  开始使用
                </h3>
                <p className="mb-4 text-gray-600 dark:text-muted-foreground">
                  配置完成后，你就可以像使用原始 OpenAI API 一样使用中转服务了
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/20">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">
                      <p className="font-medium">提示：</p>
                      <p>所有中转服务都完全兼容 OpenAI 官方 API 格式，无需修改代码逻辑</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">支持的主流模型：</p>
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
              <Terminal className="mt-0.5 h-6 w-6 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">⚠️ 注意事项</h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>请妥善保管你的 API Key，不要泄露给他人或提交到公开代码仓库</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>建议在监控面板中选择稳定在线的服务商</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>不同服务商的定价和支持的模型可能有所不同，请仔细查看服务商说明</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>API Base URL 通常以 <code className="rounded bg-blue-100 px-1.5 py-0.5 dark:bg-blue-900">/v1</code> 结尾</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>如遇到问题，可以点击右上角"进群"按钮加入 QQ 群寻求帮助</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 底部返回按钮 */}
          <div className="flex justify-center pt-8">
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
