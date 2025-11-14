export interface VPN {
  id: string
  name: string
  url: string
  description: string
  features: string[]
  rating: number
  price: string
  tags: string[]
  logo?: string
  highlights?: string[]
  paymentMethods?: string[]
  speed: "fast" | "medium" | "excellent"
  stability: "high" | "medium" | "excellent"
  inviteLink?: string  // 邀请链接
  isFree?: boolean     // 是否免费
}

export const vpnServices: VPN[] = [
  {
    id: "strongvpn",
    name: "StrongVPN",
    url: "https://overwallvpn.com/go/strongvpn",
    description: "目前唯一支持支付宝（Alipay）付款的中国VPN，专为中国用户优化",
    features: [
      "支持支付宝付款",
      "专线优化",
      "高速稳定",
      "中文客服支持",
      "30天退款保证",
      "无日志政策"
    ],
    rating: 4.8,
    price: "$10.99/月起",
    tags: ["推荐", "支付宝", "中国优化"],
    highlights: ["唯一支持支付宝", "最适合中国用户"],
    paymentMethods: ["支付宝", "信用卡", "PayPal"],
    speed: "excellent",
    stability: "excellent"
  },
  {
    id: "privatevpn",
    name: "PrivateVPN",
    url: "https://overwallvpn.com/go/privatevpn",
    description: "注重隐私保护的高速VPN服务，在中国表现稳定",
    features: [
      "零日志政策",
      "军事级加密",
      "全球服务器",
      "7天免费试用",
      "30天退款保证",
      "解锁流媒体"
    ],
    rating: 4.7,
    price: "$9.90/月起",
    tags: ["高隐私", "稳定"],
    highlights: ["极致隐私保护", "流媒体解锁"],
    paymentMethods: ["信用卡", "PayPal", "比特币"],
    speed: "excellent",
    stability: "high"
  },
  {
    id: "expressvpn",
    name: "ExpressVPN",
    url: "https://overwallvpn.com/go/expressvpn",
    description: "全球知名的顶级VPN服务，速度快、稳定性强",
    features: [
      "超高速连接",
      "全球3000+服务器",
      "24/7客服支持",
      "30天退款保证",
      "支持5台设备",
      "无限带宽"
    ],
    rating: 4.9,
    price: "$12.95/月起",
    tags: ["顶级", "高速", "推荐"],
    highlights: ["业界标杆", "最快速度"],
    paymentMethods: ["信用卡", "PayPal", "比特币"],
    speed: "excellent",
    stability: "excellent"
  },
  {
    id: "astrill",
    name: "Astrill VPN",
    url: "https://overwallvpn.com/go/astrill",
    description: "专为中国市场设计的VPN，长期在中国稳定运行",
    features: [
      "中国专线",
      "StealthVPN协议",
      "路由器支持",
      "7天免费试用",
      "24/7中文客服",
      "智能模式"
    ],
    rating: 4.6,
    price: "$15/月起",
    tags: ["中国专线", "稳定"],
    highlights: ["中国市场专家", "StealthVPN技术"],
    paymentMethods: ["信用卡", "PayPal", "银联"],
    speed: "fast",
    stability: "excellent"
  },
  {
    id: "vyprvpn",
    name: "VyprVPN",
    url: "https://overwallvpn.com/go/vyprvpn",
    description: "拥有自主服务器的VPN提供商，Chameleon协议专破封锁",
    features: [
      "Chameleon协议",
      "自有服务器",
      "无第三方",
      "30天退款",
      "NAT防火墙",
      "云存储"
    ],
    rating: 4.5,
    price: "$10/月起",
    tags: ["自有服务器", "防封锁"],
    highlights: ["Chameleon技术", "100%自有服务器"],
    paymentMethods: ["信用卡", "PayPal"],
    speed: "fast",
    stability: "high"
  },
  {
    id: "nordvpn",
    name: "NordVPN",
    url: "https://overwallvpn.com/go/nordvpn",
    description: "全球最受欢迎的VPN之一，功能全面、价格实惠",
    features: [
      "混淆服务器",
      "双重VPN",
      "6台设备同时连接",
      "30天退款保证",
      "威胁防护",
      "广告拦截"
    ],
    rating: 4.7,
    price: "$11.99/月起",
    tags: ["性价比", "功能丰富"],
    highlights: ["用户最多", "功能最全"],
    paymentMethods: ["信用卡", "PayPal", "加密货币"],
    speed: "fast",
    stability: "high"
  },
  {
    id: "lantern",
    name: "Lantern（蓝灯VPN）",
    url: "https://lantern.io/zh",
    description: "简单易用的免费VPN，适合轻度使用和临时需求",
    features: [
      "免费版可用",
      "简单易用",
      "快速安装",
      "按需付费",
      "中文界面",
      "无需注册（免费版）"
    ],
    rating: 4.0,
    price: "免费/专业版 $32/年",
    tags: ["免费", "简单", "入门"],
    highlights: ["有免费版本", "极简设计"],
    paymentMethods: ["信用卡", "PayPal"],
    speed: "medium",
    stability: "medium",
    isFree: true,
    inviteLink: "https://lantern.io/zh"
  },
  {
    id: "justmysocks",
    name: "Just My Socks",
    url: "https://overwallvpn.com/go/justmysocks",
    description: "搬瓦工官方机场，专业Shadowsocks服务，稳定可靠",
    features: [
      "CN2 GIA专线",
      "自动切换IP",
      "防封锁保证",
      "按月计费",
      "多条线路",
      "高性价比"
    ],
    rating: 4.6,
    price: "$5.88/月起",
    tags: ["机场", "SS/SSR", "性价比"],
    highlights: ["搬瓦工官方", "专业机场"],
    paymentMethods: ["支付宝", "信用卡", "PayPal"],
    speed: "excellent",
    stability: "excellent",
    inviteLink: "https://justmysocks.net/members/aff.php?aff=999"
  }
]

// 免费VPN列表
export const freeVPNServices: VPN[] = [
  {
    id: "protonvpn-free",
    name: "ProtonVPN Free",
    url: "https://protonvpn.com/free-vpn",
    description: "由瑞士公司提供的完全免费VPN服务，无日志、无广告、不限流量",
    features: [
      "完全免费",
      "不限流量",
      "无广告",
      "强加密",
      "3个国家节点",
      "单设备连接"
    ],
    rating: 4.3,
    price: "完全免费",
    tags: ["免费", "无限流量", "无广告"],
    highlights: ["零成本使用", "隐私保护强"],
    speed: "medium",
    stability: "high",
    isFree: true,
    inviteLink: "https://protonvpn.com/free-vpn"
  },
  {
    id: "windscribe-free",
    name: "Windscribe Free",
    url: "https://windscribe.com",
    description: "每月10GB免费流量，支持多个国家节点，功能丰富",
    features: [
      "10GB/月免费流量",
      "10个国家节点",
      "广告拦截",
      "防火墙",
      "无限设备",
      "邮箱注册送额外流量"
    ],
    rating: 4.2,
    price: "免费 10GB/月",
    tags: ["免费", "10GB流量", "广告拦截"],
    highlights: ["10GB免费流量", "功能全面"],
    speed: "medium",
    stability: "high",
    isFree: true,
    inviteLink: "https://windscribe.com/?affid=free2024"
  },
  {
    id: "tunnelbear-free",
    name: "TunnelBear Free",
    url: "https://www.tunnelbear.com",
    description: "界面可爱的免费VPN，每月500MB免费流量，操作简单",
    features: [
      "500MB/月免费",
      "48个国家节点",
      "超简单操作",
      "可爱界面",
      "自动连接",
      "分应用代理"
    ],
    rating: 4.0,
    price: "免费 500MB/月",
    tags: ["免费", "500MB流量", "简单易用"],
    highlights: ["最易上手", "界面友好"],
    speed: "medium",
    stability: "medium",
    isFree: true,
    inviteLink: "https://www.tunnelbear.com"
  },
  {
    id: "hide-me-free",
    name: "Hide.me Free",
    url: "https://hide.me/en/",
    description: "免费版提供10GB流量，支持5个国家节点，速度不错",
    features: [
      "10GB/月免费",
      "5个国家节点",
      "不限速度",
      "无日志",
      "HTTPS代理",
      "分流功能"
    ],
    rating: 4.1,
    price: "免费 10GB/月",
    tags: ["免费", "10GB流量", "不限速"],
    highlights: ["免费10GB", "速度较快"],
    speed: "fast",
    stability: "medium",
    isFree: true,
    inviteLink: "https://hide.me/en/"
  },
  {
    id: "cloudflare-warp",
    name: "Cloudflare WARP",
    url: "https://1.1.1.1",
    description: "Cloudflare提供的免费VPN服务，不限流量，主打隐私保护",
    features: [
      "完全免费",
      "不限流量",
      "全球CDN加速",
      "隐私保护",
      "自动优化路由",
      "简单易用"
    ],
    rating: 4.4,
    price: "完全免费",
    tags: ["免费", "无限流量", "Cloudflare"],
    highlights: ["大厂出品", "不限流量"],
    speed: "fast",
    stability: "high",
    isFree: true,
    inviteLink: "https://1.1.1.1"
  },
  {
    id: "vpngate",
    name: "VPN Gate",
    url: "https://www.vpngate.net/cn/",
    description: "筑波大学的学术项目，完全免费的志愿者VPN网络",
    features: [
      "完全免费",
      "不限流量",
      "志愿者节点",
      "开源项目",
      "全球节点",
      "无需注册"
    ],
    rating: 3.8,
    price: "完全免费",
    tags: ["免费", "无限流量", "学术项目"],
    highlights: ["学术支持", "开源透明"],
    speed: "medium",
    stability: "medium",
    isFree: true,
    inviteLink: "https://www.vpngate.net/cn/"
  }
]

export const vpnFeatures = [
  {
    title: "速度",
    description: "连接速度和带宽",
    icon: "Zap"
  },
  {
    title: "稳定性",
    description: "长期可用性和可靠性",
    icon: "Shield"
  },
  {
    title: "隐私",
    description: "数据加密和隐私保护",
    icon: "Lock"
  },
  {
    title: "价格",
    description: "性价比和付款方式",
    icon: "DollarSign"
  }
]
