import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "什么是 AI 导航？",
    answer:
      "AI 导航是一个专业的 AI 工具聚合平台，我们精心筛选并持续更新全球最优秀的 AI 工具和网站，帮助用户快速找到最适合的 AI 解决方案。",
  },
  {
    question: "免费版和付费版有什么区别？",
    answer:
      "免费版提供 200+ 基础 AI 工具的访问权限和基础搜索功能。付费版则提供全部 500+ 工具访问、高级搜索、专业评测报告、优先客服支持等更多功能。",
  },
  {
    question: "如何确保推荐工具的质量？",
    answer:
      "我们的专业团队会对每个工具进行深度测试和评估，包括功能性、易用性、安全性等多个维度。只有通过严格审核的工具才会被收录到我们的平台。",
  },
  {
    question: "工具更新频率如何？",
    answer:
      "我们每天都会更新平台内容，包括新增工具、更新现有工具信息、添加用户评价等。专业版用户还会收到每周精选推荐。",
  },
  {
    question: "可以申请退款吗？",
    answer: "我们提供 7 天无理由退款保证。如果您对我们的服务不满意，可以在购买后 7 天内申请全额退款。",
  },
  {
    question: "企业版有什么特殊服务？",
    answer:
      "企业版除了包含专业版的所有功能外，还提供团队协作功能、定制化推荐、专属客户经理、API 访问权限、企业级安全保障和定制化培训等服务。",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">常见问题</h2>
          <p className="text-pretty text-lg text-muted-foreground">关于 AI 导航的常见问题解答</p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
