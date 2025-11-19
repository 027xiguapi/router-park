"use client"

import Markdown from 'markdown-to-jsx'

const apiProvidersMarkdown = `
## API中转站列表

| 服务商       | 价格                                   | 模型                          | 官网链接                                |
|------------|--------------------------------------|-----------------------------|--------------------------------------|
| gptgod     | 0.6R 一刀                            | OpenAI + gpt-4o-all逆向      | https://gptgod.cloud/    |
| yunwu     | 1R 一刀                            | 全面的模型支持      | https://yunwu.ai/   |
| zhtec      | 0.5R 一刀(svip)，0.6R 一刀(普通)     | OpenAI + Claude              | https://api1.zhtec.xyz/ |
| chienapi   | 1R 一刀，官转 2R 一刀                | OpenAI                       | http://chienapi.top/    |
| 35-aigcbest| AZ 1.5R 一刀，官转更贵              | OpenAI                       | https://35.aigcbest.top/|
| xjai-new   | az分组 0.9R 一刀                     | OpenAI                       | https://new.xjai.cc/    |
| bltcy      | az 1元 一刀，官转 2.5元              | OpenAI                       | https://api.bltcy.ai/   |
| gptapi     | 4o-mini模型 1R 一刀，其他高价        | OpenAI                       | https://www.gptapi.us/  |
| xeduapi    | 3.18R 一刀                           | OpenAI                       | https://xeduapi.com/    |
| tomchat    | 0.5R 一刀（4o-mini 价格贵）           | OpenAI                       | https://api.tomchat.fun/|
| v3         | 2R 一刀                              | OpenAI                       | https://api.v3.cm/      |
| ephone     | 1R 一刀                              | OpenAI                       | https://api.ephone.ai/  |
| nekoapi    | 1.5R-2R 一刀                         | OpenAI + Claude              | https://api.nekoapi.com/|
| sbgpt      | az无o1分组 0.4R 一刀                 | OpenAI                       | https://go.sbgpt.site/  |
| ggwk1      | 1R 一刀，az分组 0.6R 一刀，claude 0.8R | OpenAI + Claude + Gemini     | https://www.ggwk1.online/|
| GalaxyAPI  | 1R 一刀                              | OpenAI                       | https://api.openai-ch.top/|
| paintbot   | 0.5R 一刀                            | OpenAI + Claude + Gemini     | https://oneapi.paintbot.top/|
| chatfire   | 1R 一刀（特价分组 0.5R）             | OpenAI + Claude + 国产AI + 图片 + 视频 | https://api.chatfire.cn/|
| aabao      | 0.8R 一刀（az 0.3R）                 | OpenAI + Claude + Gemini     | https://api.aabao.top/   |
| gptuu      | 1R 一刀                              | OpenAI + Claude + Gemini     | https://opus.gptuu.com/  |
| boneapi    | 1R 一刀，az分组 0.8R                 | OpenAI + Claude + Gemini     | https://open.api.gu28.top/|
| YuegleAPI  | 0.6R 一刀                            | Claude + Gemini + ChatGPT-4o | https://api.yuegle.com/  |
| kksj       | 0.9R 一刀                            | OpenAI + Claude + Gemini     | https://cnapi.kksj.org/  |
| ShawnAPI   | 0.95R 一刀                           | OpenAI                       | https://api.gptoai.cc/  |
| KFCV50API  | 0.2R 一刀 (az部分)，0.8R 一刀 (az全模型) | OpenAI + Claude              | https://kfcv50.link/     |
| Nio        | 1R 一刀                              | OpenAI + Claude + Gemini + 其他模型 | https://api.nio.gs/     |
| GueAi      | az分组 0.5R 一刀                     | OpenAI + Claude              | https://api.gueai.com/  |
| OneChats   | 2R 一刀                              | OpenAI + Claude + Gemini     | https://chatapi.onechats.top/|
| MaynorAPI  | 2R 一刀                              | OpenAI + Claude + Gemini     | https://apipro.maynor1024.live/|
| azapi      | 春节活动 0.3R 一刀，日常 az 0.8R 一刀 | OpenAI + Claude + Gemini     | https://azapi.com.cn/   |
| openaiLabs | az 0.5R 一刀，纯OpenAI 2.5R 一刀     | OpenAI + Claude + Gemini     | https://www.openai-labs.com/|
`

export function APIProvidersTable() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <Markdown
          options={{
            overrides: {
              h2: {
                props: {
                  className: "text-2xl font-bold mb-4 text-foreground"
                }
              },
              table: {
                props: {
                  className: "w-full border-collapse border border-border rounded-lg overflow-hidden"
                }
              },
              thead: {
                props: {
                  className: "bg-muted"
                }
              },
              th: {
                props: {
                  className: "border border-border px-4 py-2 text-left font-semibold text-foreground"
                }
              },
              td: {
                props: {
                  className: "border border-border px-4 py-2 text-muted-foreground"
                }
              },
              a: {
                props: {
                  className: "text-primary hover:text-primary/80 underline"
                }
              }
            }
          }}
        >
          {apiProvidersMarkdown}
        </Markdown>
      </div>
    </div>
  )
}