import { Card } from "@/components/ui/card"
import { Search, CheckCircle2, Rocket } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "浏览与搜索",
    description: "通过分类浏览或使用搜索功能，快速找到您需要的 AI 工具类型",
  },
  {
    icon: CheckCircle2,
    title: "查看详情",
    description: "阅读详细的工具介绍、功能特性、用户评价和专业评测",
  },
  {
    icon: Rocket,
    title: "开始使用",
    description: "一键访问工具官网，立即开始使用，提升您的工作效率",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">使用流程</h2>
          <p className="text-pretty text-lg text-muted-foreground">三步即可找到最适合您的 AI 工具</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <Card className="relative h-full border-border bg-card p-8">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-0.5 w-8 -translate-y-1/2 translate-x-full bg-border md:block" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
