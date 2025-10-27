import { Sparkles } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-semibold">AI 导航</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                发现最优秀的 AI 工具
                <br />
                提升您的工作效率
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">产品</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                    功能特性
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                    定价方案
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    更新日志
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">资源</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    使用文档
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
                    常见问题
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    博客
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold">联系我们</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:xxxx@gmail.com"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    xxxx@gmail.com
                  </a>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                    加入我们
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2025 西瓜皮. 保留所有权利.</p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                隐私政策
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                服务条款
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                Cookie 政策
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
