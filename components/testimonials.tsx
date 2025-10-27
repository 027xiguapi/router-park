import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "张伟",
    role: "产品经理",
    company: "某科技公司",
    content: "这个平台帮我节省了大量寻找 AI 工具的时间，每个工具的评测都非常专业和详细。强烈推荐！",
    rating: 5,
  },
  {
    name: "李娜",
    role: "设计师",
    company: "某设计工作室",
    content: "作为设计师，我经常需要使用各种 AI 工具。这个导航网站让我能快速找到最适合的工具，大大提升了工作效率。",
    rating: 5,
  },
  {
    name: "王强",
    role: "创业者",
    company: "某初创公司",
    content: "分类清晰，更新及时，每个工具都有详细介绍。对于我们这种需要快速试错的创业团队来说，这个平台太有价值了。",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">用户评价</h2>
          <p className="text-pretty text-lg text-muted-foreground">看看其他用户如何评价我们的服务</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border bg-card p-8">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="mb-6 text-muted-foreground">{testimonial.content}</p>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role} · {testimonial.company}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
