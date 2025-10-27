import { Card } from "@/components/ui/card"
import { Search, Filter, Star, TrendingUp, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "智能搜索",
    description: "强大的搜索引擎，支持多维度筛选，快速找到您需要的 AI 工具",
  },
  {
    icon: Filter,
    title: "精准分类",
    description: "按功能、行业、价格等多个维度分类，让您轻松浏览相关工具",
  },
  {
    icon: Star,
    title: "专业评测",
    description: "每个工具都经过我们团队的深度测试和专业评估",
  },
  {
    icon: TrendingUp,
    title: "实时更新",
    description: "每日更新最新的 AI 工具，确保您不会错过任何创新产品",
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "所有推荐工具都经过安全审核，保护您的数据隐私",
  },
  {
    icon: Zap,
    title: "快速访问",
    description: "一键直达工具官网，节省您的搜索时间",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            为什么选择我们
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">我们提供最全面、最专业的 AI 工具导航服务</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-border bg-card p-8 transition-all hover:border-accent/50 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
