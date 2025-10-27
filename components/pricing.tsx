import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    description: "适合个人用户探索 AI 工具",
    features: ["访问 200+ 基础 AI 工具", "基础搜索功能", "每日更新", "社区支持"],
    cta: "开始使用",
    popular: false,
  },
  {
    name: "专业版",
    price: "¥99",
    period: "每月",
    description: "适合专业人士和小团队",
    features: [
      "访问全部 500+ AI 工具",
      "高级搜索与筛选",
      "专业评测报告",
      "优先客服支持",
      "工具使用教程",
      "每周精选推荐",
    ],
    cta: "立即订阅",
    popular: true,
  },
  {
    name: "企业版",
    price: "¥999",
    period: "每月",
    description: "适合企业和大型团队",
    features: [
      "专业版所有功能",
      "团队协作功能",
      "定制化推荐",
      "专属客户经理",
      "API 访问权限",
      "企业级安全保障",
      "定制化培训",
    ],
    cta: "联系销售",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            选择适合您的方案
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">灵活的定价方案，满足不同规模用户的需求</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-border bg-card p-8 ${plan.popular ? "border-2 border-accent shadow-xl" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                    最受欢迎
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="ml-2 text-muted-foreground">/ {plan.period}</span>
              </div>
              <Button
                className={`mb-8 w-full ${plan.popular ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-accent" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
