export interface ChatGPTMirror {
  id: string
  name: string
  url: string
  description: string
  features: string[]
  status: "online" | "offline" | "unstable"
  requiresLogin: boolean
  isFree: boolean
  tags: string[]
}

export const chatgptMirrors: ChatGPTMirror[] = [
  {
    id: "chatgptplus",
    name: "ChatGPT Plus",
    url: "https://chatgptplus.cn/",
    description: "稳定的 ChatGPT 镜像站，支持多种模型",
    features: ["GPT-4", "GPT-3.5", "无需翻墙", "中文界面"],
    status: "online",
    requiresLogin: false,
    isFree: true,
    tags: ["推荐", "稳定"],
  },
  {
    id: "share-ai",
    name: "Share AI",
    url: "https://free.share-ai.top/pastel/#/claude-carlist",
    description: "免费分享型 AI 站点，支持 Claude 和 ChatGPT",
    features: ["Claude", "ChatGPT", "免费使用", "多模型"],
    status: "online",
    requiresLogin: false,
    isFree: true,
    tags: ["免费", "Claude"],
  },
  {
    id: "tokenspark",
    name: "TokenSpark",
    url: "https://chat.tokenspark.net/",
    description: "高速稳定的 ChatGPT 镜像服务",
    features: ["快速响应", "GPT-4", "稳定在线"],
    status: "online",
    requiresLogin: false,
    isFree: true,
    tags: ["快速", "稳定"],
  },
  {
    id: "chatshare",
    name: "ChatShare",
    url: "https://node1.chatshare.biz/login",
    description: "需要登录的 ChatGPT 共享站点",
    features: ["GPT-4", "需要登录", "共享账号"],
    status: "online",
    requiresLogin: true,
    isFree: true,
    tags: ["需登录"],
  },
  {
    id: "douresources",
    name: "Dou Resources",
    url: "https://ai.douresources.com",
    description: "综合性 AI 资源平台",
    features: ["多种 AI 模型", "资源丰富", "中文支持"],
    status: "online",
    requiresLogin: false,
    isFree: true,
    tags: ["综合"],
  },
  {
    id: "poe",
    name: "Poe (官方)",
    url: "https://poe.com/ChatGPT",
    description: "Quora 官方 AI 聊天平台，支持多种模型",
    features: ["官方平台", "多模型", "Claude", "GPT-4"],
    status: "online",
    requiresLogin: true,
    isFree: false,
    tags: ["官方", "多模型"],
  },
  {
    id: "knowledgetoproduct",
    name: "Knowledge to Product",
    url: "https://www.knowledgetoproduct.com/",
    description: "知识产品化 AI 助手平台",
    features: ["知识管理", "ChatGPT", "生产力工具"],
    status: "online",
    requiresLogin: false,
    isFree: true,
    tags: ["生产力"],
  },
  {
    id: "codenews",
    name: "CodeNews ChatGPT",
    url: "https://codenews.cc/chatgpt",
    description: "面向程序员的 ChatGPT 镜像站",
    features: ["代码优化", "程序员友好", "技术问答"],
    status: "online",
    requiresLogin: false,
    isFree: true,
    tags: ["代码", "程序员"],
  },
  {
    id: "gege-chat",
    name: "格格 Chat",
    url: "https://gege.chat/list/#/home",
    description: "国内优质 AI 聊天镜像平台",
    features: ["中文优化", "GPT-4", "稳定访问"],
    status: "online",
    requiresLogin: false,
    isFree: true,
    tags: ["中文", "稳定"],
  },
  {
    id: "aiok",
    name: "AIOK",
    url: "https://aiok.me/pastel#/login",
    description: "简洁易用的 AI 聊天平台",
    features: ["简洁界面", "需要登录", "多模型支持"],
    status: "online",
    requiresLogin: true,
    isFree: true,
    tags: ["简洁"],
  },
]
