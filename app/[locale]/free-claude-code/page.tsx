'use client'

import { useState } from 'react'
import { Copy, Check, Code, Sparkles, Terminal, Zap, Shield, Cpu, Globe, Users, Star, MessageSquare, HelpCircle, ChevronDown, ChevronUp, Play, FileCode, GitBranch } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useUser } from '@/contexts/user-context'
import KeywordToolPage from "@/app/[locale]/keyword-tool/page";
import {Link} from "@/i18n/navigation";

export default function FreeClaudeCodePage() {
    const t = useTranslations('freeClaudeCode')
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
    const { user, showLoginModal } = useUser()

    const config = {
        ANTHROPIC_API_KEY: 'sk-gmoc2FR54apTAJkopcLPuy0MAifx0Z07HHsx16MvXvdFTGYm',
        ANTHROPIC_BASE_URL: 'https://any.routerpark.com'
    }

    const handleCopy = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedField(field)
            toast.success(t('toast.copySuccess') || '复制成功')
            setTimeout(() => setCopiedField(null), 2000)
        } catch (error) {
            toast.error(t('toast.copyFailed') || '复制失败')
        }
    }

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index)
    }

    // Hero Section
    const HeroSection = () => (
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="container mx-auto px-4 relative">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">免费使用 · 无需信用卡</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        免费 Claude Code & Codex
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                        体验世界领先的 AI 编程助手，完全免费。无需信用卡，无需订阅，即刻开始编写更好的代码。
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => document.getElementById('config')?.scrollIntoView({ behavior: 'smooth' })}>
                            <Play className="h-5 w-5" />
                            立即开始使用
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                            <FileCode className="h-5 w-5" />
                            查看使用教程
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
                            <div className="text-3xl font-bold text-primary mb-2">100%</div>
                            <div className="text-sm text-muted-foreground">完全免费</div>
                        </div>
                        <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
                            <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                            <div className="text-sm text-muted-foreground">活跃用户</div>
                        </div>
                        <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
                            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                            <div className="text-sm text-muted-foreground">全天候可用</div>
                        </div>
                        <div className="p-6 rounded-xl bg-background/50 backdrop-blur border">
                            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                            <div className="text-sm text-muted-foreground">服务可用性</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

    // Features Section
    const FeaturesSection = () => {
        const features = [
            {
                icon: <Terminal className="h-8 w-8" />,
                title: 'Claude Code 集成',
                description: '完整支持 Claude Code CLI，在终端中直接使用 AI 助手完成编程任务，提升开发效率。'
            },
            {
                icon: <Code className="h-8 w-8" />,
                title: 'OpenAI Codex 兼容',
                description: '兼容 OpenAI Codex API，可无缝替换现有的 Codex 集成，享受更强大的代码生成能力。'
            },
            {
                icon: <Zap className="h-8 w-8" />,
                title: '超快响应速度',
                description: '优化的 API 端点确保毫秒级响应，让你的编程工作流程更加流畅，无需等待。'
            },
            {
                icon: <Shield className="h-8 w-8" />,
                title: '安全可靠',
                description: '企业级安全保障，你的代码和数据完全加密传输，严格遵守隐私保护政策。'
            },
            {
                icon: <Cpu className="h-8 w-8" />,
                title: 'Claude Sonnet 4.5',
                description: '基于最新的 Claude Sonnet 4.5 模型，提供业界领先的代码理解和生成能力。'
            },
            {
                icon: <Globe className="h-8 w-8" />,
                title: '全球 CDN 加速',
                description: '遍布全球的 CDN 节点，无论你在哪里，都能享受最快的访问速度。'
            },
            {
                icon: <GitBranch className="h-8 w-8" />,
                title: '多语言支持',
                description: '支持 Python、JavaScript、TypeScript、Go、Rust 等 50+ 种编程语言。'
            },
            {
                icon: <Users className="h-8 w-8" />,
                title: '社区驱动',
                description: '活跃的开发者社区，分享最佳实践和使用技巧，共同构建更好的开发体验。'
            }
        ]

        return (
            <section id="features" className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-sm font-medium">核心功能</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                为什么选择我们的服务
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                我们提供完整的 Claude Code 和 Codex 功能，让你免费体验世界级 AI 编程助手的强大能力
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                                    <CardHeader>
                                        <div className="mb-4 text-primary group-hover:scale-110 transition-transform">
                                            {feature.icon}
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // How It Works Section
    const HowItWorksSection = () => {
        const steps = [
            {
                number: '01',
                title: '复制配置信息',
                description: '从下方配置区域复制 API Key 和 Base URL，无需注册账号即可开始使用。',
                icon: <Copy className="h-6 w-6" />
            },
            {
                number: '02',
                title: '配置环境变量',
                description: '将配置信息添加到你的 .claude/config.json 文件或环境变量中，简单快捷。',
                icon: <FileCode className="h-6 w-6" />
            },
            {
                number: '03',
                title: '开始使用',
                description: '在终端运行 claude 命令或使用 Codex API，立即开始享受 AI 编程助手的强大功能。',
                icon: <Terminal className="h-6 w-6" />
            },
            {
                number: '04',
                title: '编写更好的代码',
                description: '利用 AI 助手的代码补全、重构建议和错误修复功能，大幅提升编程效率。',
                icon: <Zap className="h-6 w-6" />
            }
        ]

        return (
            <section id="how-it-works" className="py-20 bg-gradient-to-b from-secondary/20 to-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                                <Play className="h-4 w-4" />
                                <span className="text-sm font-medium">使用指南</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                四步开始使用
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                简单配置，即刻开始。无需复杂的设置流程，几分钟即可完成配置并开始使用。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="relative">
                                    <div className="relative">
                                        <div className="mb-4">
                                            <div className="text-6xl font-bold text-primary/20 mb-2">{step.number}</div>
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // Testimonials Section
    const TestimonialsSection = () => {
        const testimonials = [
            {
                name: '张伟',
                role: '全栈工程师',
                company: '字节跳动',
                avatar: '👨‍💻',
                content: '使用免费的 Claude Code 后，我的编程效率提升了至少 40%。代码补全和重构建议非常精准，大大减少了调试时间。',
                rating: 5
            },
            {
                name: '李娜',
                role: '前端开发',
                company: '阿里巴巴',
                avatar: '👩‍💻',
                content: '作为一个前端开发者，Claude Code 帮我快速理解复杂的业务逻辑。无需付费就能使用这么强大的工具，真的太棒了！',
                rating: 5
            },
            {
                name: '王强',
                role: 'AI 研究员',
                company: '清华大学',
                avatar: '🧑‍🔬',
                content: 'Claude Sonnet 4.5 的代码理解能力令人惊叹。无论是 Python 还是 C++，都能给出专业级的建议。免费服务的质量完全超出预期。',
                rating: 5
            },
            {
                name: '陈静',
                role: '后端开发',
                company: '腾讯',
                avatar: '👩‍💼',
                content: '之前一直在用付费的 Copilot，现在切换到这个免费服务后发现效果更好。响应速度快，代码质量高，强烈推荐！',
                rating: 5
            },
            {
                name: '刘明',
                role: '独立开发者',
                company: '自由职业',
                avatar: '👨‍🎨',
                content: '作为独立开发者，这个免费服务帮我节省了大量成本。现在我可以把更多精力放在产品创新上，而不是重复性的编码工作。',
                rating: 5
            },
            {
                name: '赵芳',
                role: 'DevOps 工程师',
                company: '美团',
                avatar: '👩‍🔧',
                content: '配置简单，使用方便。特别是在编写复杂的脚本和配置文件时，Claude Code 总能给出最优解。真正的开发者福音！',
                rating: 5
            }
        ]

        return (
            <section id="testimonials" className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                                <MessageSquare className="h-4 w-4" />
                                <span className="text-sm font-medium">用户评价</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                开发者都在说什么
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                来自全球 10,000+ 开发者的真实反馈，看看他们如何使用我们的服务提升编程效率
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, index) => (
                                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                                    <CardHeader>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-4xl">{testimonial.avatar}</div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                                                <CardDescription>{testimonial.role}</CardDescription>
                                                <CardDescription className="text-xs">{testimonial.company}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // FAQ Section
    const FAQSection = () => {
        const faqs = [
            {
                question: '这个服务真的完全免费吗？',
                answer: '是的！我们提供的 Claude Code 和 Codex API 服务完全免费，无需信用卡，无隐藏费用。我们的目标是让更多开发者能够体验到 AI 编程助手的强大功能。'
            },
            {
                question: '使用限制是什么？',
                answer: '我们为每个用户提供充足的 API 调用配额，足够日常开发使用。如果你是重度用户，我们也提供企业级服务方案。具体限制请参考使用文档。'
            },
            {
                question: '支持哪些编程语言？',
                answer: '我们支持 50+ 种主流编程语言，包括但不限于 Python、JavaScript、TypeScript、Java、C++、Go、Rust、PHP、Ruby、Swift、Kotlin 等。'
            },
            {
                question: 'Claude Code 和 OpenAI Codex 有什么区别？',
                answer: 'Claude Code 基于 Anthropic 的 Claude Sonnet 4.5 模型，在代码理解、上下文处理和安全性方面表现更优。同时我们的服务兼容 Codex API，可以无缝替换。'
            },
            {
                question: '如何保证代码安全和隐私？',
                answer: '我们严格遵守数据隐私政策，所有代码传输采用 HTTPS 加密，不会存储或分析你的代码内容。我们使用企业级安全措施保护你的数据。'
            },
            {
                question: '遇到问题如何获取支持？',
                answer: '我们提供详细的文档和 FAQ。如有其他问题，可以通过 GitHub Issues、Discord 社区或邮件联系我们的技术支持团队。'
            },
            {
                question: 'API 响应速度如何？',
                answer: '我们在全球部署了多个 CDN 节点，平均响应时间在 100-300ms 之间。即使在高峰期，也能保证稳定的服务质量。'
            },
            {
                question: '可以在商业项目中使用吗？',
                answer: '可以！我们的免费服务允许商业使用。对于大型企业项目，我们也提供定制化的企业级服务方案，包括 SLA 保障和专属支持。'
            }
        ]

        return (
            <section id="faq" className="py-20 bg-gradient-to-b from-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                                <HelpCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">常见问题</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                常见问题解答
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                这里收集了用户最常问的问题，如果你有其他疑问，欢迎联系我们
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <Card key={index} className="border-2 hover:border-primary/50 transition-all overflow-hidden">
                                    <CardHeader
                                        className="cursor-pointer hover:bg-secondary/20 transition-colors"
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg pr-8">{faq.question}</CardTitle>
                                            {expandedFaq === index ? (
                                                <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            )}
                                        </div>
                                    </CardHeader>
                                    {expandedFaq === index && (
                                        <CardContent className="pt-0 pb-6">
                                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // Configuration Section
    const ConfigSection = () => (
        <section id="config" className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                            <Code className="h-4 w-4" />
                            <span className="text-sm font-medium">配置信息</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            获取你的免费配置
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            复制下方配置信息，添加到你的 Claude Code 或 Codex 项目中
                        </p>
                    </div>

                    <Card className="border-2 shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Terminal className="h-5 w-5 text-primary" />
                                    <CardTitle>环境配置</CardTitle>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(`ANTHROPIC_API_KEY=${config.ANTHROPIC_API_KEY}\nANTHROPIC_BASE_URL=${config.ANTHROPIC_BASE_URL}`, 'all')}
                                    className="gap-2"
                                >
                                    {copiedField === 'all' ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-500" />
                                            已复制
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            复制全部
                                        </>
                                    )}
                                </Button>
                            </div>
                            <CardDescription>
                                将以下配置添加到你的 .claude/config.json 或环境变量中
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* JSON Config */}
                            <div className="relative">
                <pre className="bg-secondary/50 rounded-lg p-4 overflow-x-auto border">
                  <code className="text-sm font-mono">
{`{
  "env": {
    "ANTHROPIC_API_KEY": "${config.ANTHROPIC_API_KEY}",
    "ANTHROPIC_BASE_URL": "${config.ANTHROPIC_BASE_URL}"
  }
}`}
                  </code>
                </pre>
                            </div>

                            {/* Individual Fields */}
                            <div className="space-y-3 pt-4 border-t">
                                <p className="text-sm font-medium mb-2">单独复制配置项</p>

                                {Object.entries(config).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-muted-foreground mb-1">
                                                {key}
                                            </div>
                                            <div className="text-sm font-mono truncate">
                                                {value}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopy(value, key)}
                                            className="flex-shrink-0"
                                        >
                                            {copiedField === key ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Usage Instructions */}
                            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-500" />
                                    快速配置指南
                                </h4>
                                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                    <li>在项目根目录创建 <code className="bg-secondary px-1 rounded">.claude</code> 文件夹</li>
                                    <li>在 .claude 文件夹中创建 <code className="bg-secondary px-1 rounded">config.json</code> 文件</li>
                                    <li>复制上方配置内容并粘贴到 config.json 中</li>
                                    <li>保存文件后即可在终端运行 <code className="bg-secondary px-1 rounded">claude</code> 命令</li>
                                </ol>
                            </div>

                            {/* Additional Info */}
                            <div className="grid md:grid-cols-3 gap-4 mt-6">
                                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                                    <div className="text-2xl font-bold text-primary mb-1">Claude Sonnet 4.5</div>
                                    <div className="text-xs text-muted-foreground">最新模型</div>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                                    <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
                                    <div className="text-xs text-muted-foreground">可用性保证</div>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                                    <div className="text-2xl font-bold text-primary mb-1">&lt;200ms</div>
                                    <div className="text-xs text-muted-foreground">平均响应时间</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA */}
                    <div className="mt-12 text-center">
                        <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20">
                            <h3 className="text-2xl font-bold mb-4">准备好开始了吗？</h3>
                            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                加入 10,000+ 开发者，立即体验 AI 编程助手的强大功能。完全免费，无需信用卡。
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                    <Sparkles className="h-5 w-5" />
                                    返回顶部
                                </Button>
                                <Button size="lg" variant="outline" className="gap-2" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>
                                    <HelpCircle className="h-5 w-5" />
                                    查看更多问题
                                </Button>
                                <Button size="lg" variant="outline" className="gap-2">
                                    <Link href="/config-guide">配置文档</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

    return (
        <div className="min-h-screen">
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <ConfigSection />
            <TestimonialsSection />
            <FAQSection />
        </div>
    )
}
