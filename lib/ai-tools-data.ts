export interface AITool {
  id: string
  name: string
  description: string
  image: string
  url: string
  category: string
  tags: string[]
  stats: {
    country: string
    countryFlag: string
    percentage: string
    traffic: string
    likes: number
  }
}

export const categories = [
  { id: "all", name: "全部", icon: "Grid3x3" },
  { id: "chat", name: "AI 聊天", icon: "MessageSquare" },
  { id: "coding", name: "代码助手", icon: "Code" },
  { id: "design", name: "设计生成", icon: "Palette" },
  { id: "website", name: "网站构建", icon: "Globe" },
  { id: "content", name: "内容生成", icon: "FileText" },
  { id: "other", name: "其他工具", icon: "Sparkles" },
]

export const aiTools: AITool[] = [
  {
    id: "ai-chatshot",
    name: "AI ChatShot",
    description: "ChatShot.ai免费AI聊聊天大生成器，一键生成适合WhatsApp聊天截图，无需注册，支持多语言，内容可编辑，适合娱乐与创作。",
    image: "/img/tools/ai-chatshot.png",
    url: "https://chatshot.ai",
    category: "content",
    tags: ["AI内容生成"],
    stats: {
      country: "美国",
      countryFlag: "🇺🇸",
      percentage: "--",
      traffic: "--",
      likes: 0,
    },
  },
  {
    id: "qoder",
    name: "Qoder",
    description: "Qoder 是一款智能、强大的代码开发平台，支持多模型和多种开发方式，适合需要高效开发和协作的个人与团队。",
    image: "/img/tools/qoder.png",
    url: "https://qoder.com",
    category: "coding",
    tags: ["代码助手"],
    stats: {
      country: "中国",
      countryFlag: "🇨🇳",
      percentage: "46.65%",
      traffic: "1.7M",
      likes: 11,
    },
  },
  {
    id: "lumi",
    name: "Lumi",
    description: "Lumi.new 让你通过与 AI 聊天，轻松快速生成各种风格的网站，无需编程基础，适合个人和企业用户。",
    image: "/img/tools/lumi.png",
    url: "https://lumi.new",
    category: "website",
    tags: ["网站构建器"],
    stats: {
      country: "巴西",
      countryFlag: "🇧🇷",
      percentage: "57.74%",
      traffic: "70.2K",
      likes: 9,
    },
  },
  {
    id: "paraflow",
    name: "Paraflow",
    description: "Paraflow 是一站式 AI 产品设计助手，帮你从想法到高保真界面和开发规范，快速完成产品定义与设计。",
    image: "/img/tools/paraflow.png",
    url: "https://paraflow.com",
    category: "design",
    tags: ["设计生成器", "工作流程"],
    stats: {
      country: "中国",
      countryFlag: "🇨🇳",
      percentage: "75.82%",
      traffic: "26.2K",
      likes: 14,
    },
  },
  {
    id: "proxyshare",
    name: "ProxyShare",
    description: "ProxyShare在安全优质的基础上提供一站式代理服务，由专业团队广告联盟为您服务，可自定义化代理配置，无隐藏费用。",
    image: "/img/tools/proxyshare.png",
    url: "https://proxyshare.com",
    category: "other",
    tags: ["代理服务"],
    stats: {
      country: "美国",
      countryFlag: "🇺🇸",
      percentage: "18.20%",
      traffic: "69.3K",
      likes: 0,
    },
  },
  {
    id: "poseup",
    name: "PoseUp",
    description: "PoseUp.ai是一款一键优化女性服饰生成、拍摄和文字交互,创意编辑工具,基于先进的AI技术。",
    image: "/img/tools/poseup.png",
    url: "https://poseup.ai",
    category: "design",
    tags: ["图片编辑"],
    stats: {
      country: "越南",
      countryFlag: "🇻🇳",
      percentage: "71.17%",
      traffic: "2.2K",
      likes: 0,
    },
  },
  {
    id: "celebration-art",
    name: "Celebration Art",
    description: "Celebration Art让你轻松将照片变成艺术独特的人工大定制化礼品,如T恤、帆布包、马克杯等。",
    image: "/img/tools/celebration-art.png",
    url: "https://celebration.art",
    category: "design",
    tags: ["艺术生成"],
    stats: {
      country: "奥地利",
      countryFlag: "🇦🇹",
      percentage: "100.00%",
      traffic: "148",
      likes: 0,
    },
  },
  {
    id: "svg-to-3d",
    name: "SVG to 3D",
    description: "SVG to 3D Converter是一款免费在线工具，能快速且专业地将2D SVG图形转换为高质量3D模型。",
    image: "/img/tools/svg-to-3d.png",
    url: "https://svg-to-3d.com",
    category: "design",
    tags: ["3D转换"],
    stats: {
      country: "俄罗斯",
      countryFlag: "🇷🇺",
      percentage: "42.62%",
      traffic: "1.0K",
      likes: 0,
    },
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "ChatGPT 是 OpenAI 开发的强大 AI 聊天助手，可以回答问题、编写代码、创作内容等。",
    image: "/img/tools/chatgpt.png",
    url: "https://chat.openai.com",
    category: "chat",
    tags: ["AI聊天", "代码助手", "内容生成"],
    stats: {
      country: "美国",
      countryFlag: "🇺🇸",
      percentage: "45.30%",
      traffic: "1.8B",
      likes: 1250,
    },
  },
  {
    id: "claude",
    name: "Claude",
    description: "Claude 是 Anthropic 开发的 AI 助手，擅长深度对话、代码编写和复杂任务处理。",
    image: "/img/tools/claude.png",
    url: "https://claude.ai",
    category: "chat",
    tags: ["AI聊天", "代码助手"],
    stats: {
      country: "美国",
      countryFlag: "🇺🇸",
      percentage: "42.10%",
      traffic: "150M",
      likes: 890,
    },
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Google Gemini 是 Google 最新的多模态 AI 模型，支持文本、图像等多种输入。",
    image: "/img/tools/gemini.png",
    url: "https://gemini.google.com",
    category: "chat",
    tags: ["AI聊天", "多模态"],
    stats: {
      country: "美国",
      countryFlag: "🇺🇸",
      percentage: "38.50%",
      traffic: "500M",
      likes: 720,
    },
  },
]
