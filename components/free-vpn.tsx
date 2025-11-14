"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Download
} from "lucide-react"
import Image from "next/image"
import { Link } from '@/i18n/navigation'
import { useTranslations } from "next-intl"

// 配置信息 - 您可以轻松修改这些值
const VPN_CONFIG = {
  // VPN订阅地址（您的实际订阅链接）
  subscriptionUrl: "https://sub3.smallstrawberry.com/api/v1/client/subscribe?token=e001c6c2898588f9cfc856e42e247723",

  // 二维码图片路径（请将您的二维码图片放在 public 目录下）
  qrCodeImage: "/vpn-qr.png",

  // 邀请链接
  inviteLink: "https://xn--4gq62f52gdss.top/#/register?code=pLMhKWOx",

  // VPN名称
  name: "免费VPN订阅",

  // 描述
  description: "高速稳定的免费VPN服务，扫码或复制订阅地址即可使用"
}

export function FreeVPN() {
  const t = useTranslations("freeVpn")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(VPN_CONFIG.subscriptionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="h-12 w-12 text-green-600" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 bg-clip-text text-transparent">
              免费 VPN 订阅
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            完全免费，无需注册，一键订阅即可使用
          </p>
        </div>

        {/* 主卡片 */}
        <Card className="max-w-5xl mx-auto border-2 border-green-500/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  {VPN_CONFIG.name}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {VPN_CONFIG.description}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-500 text-white hover:bg-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  高速
                </Badge>
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                  <Globe className="h-3 w-3 mr-1" />
                  稳定
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 左侧：订阅地址 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-600" />
                    订阅地址
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={VPN_CONFIG.subscriptionUrl}
                        className="font-mono text-sm bg-muted"
                      />
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="shrink-0 border-green-500/50 hover:bg-green-500/10"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-600" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            复制
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      复制上方链接，粘贴到您的VPN客户端中即可使用
                    </p>
                  </div>
                </div>

                {/* 使用步骤 */}
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">
                    使用步骤：
                  </h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">1.</span>
                      <span>下载并安装VPN客户端（如 Clash、V2rayN等）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">2.</span>
                      <span>复制订阅地址或扫描二维码</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">3.</span>
                      <span>在客户端中添加订阅链接</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">4.</span>
                      <span>更新订阅并选择节点，开始使用</span>
                    </li>
                  </ol>
                </div>

                {/* 邀请链接按钮 */}
                <Link
                  href={VPN_CONFIG.inviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    访问邀请链接获取更多福利
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* 右侧：二维码 */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-2 border-green-200 dark:border-green-800">
                  <div className="mb-4 text-center">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                      扫码订阅
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      使用客户端扫描下方二维码
                    </p>
                  </div>
                  <div className="relative w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300 dark:border-green-700">
                    <Image
                      src={VPN_CONFIG.qrCodeImage}
                      alt="VPN订阅二维码"
                      width={240}
                      height={240}
                      className="rounded"
                      onError={(e) => {
                        // 如果图片加载失败，显示占位符
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="text-center p-4">
                              <div class="text-4xl mb-2">📱</div>
                              <p class="text-sm text-muted-foreground">请将二维码图片放置在<br/><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">${VPN_CONFIG.qrCodeImage}</code></p>
                            </div>
                          `
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    使用Clash、V2rayN等客户端扫描
                  </p>
                </div>
              </div>
            </div>

            {/* 底部提示 */}
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    温馨提示
                  </p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• 本服务仅供学习交流使用，请遵守当地法律法规</li>
                    <li>• 建议定期更新订阅以获取最新节点</li>
                    <li>• 如遇问题，请通过邀请链接联系获取帮助</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 特性卡片 */}
        <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
          <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-green-600" />
                高速稳定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                优质线路，低延迟，高带宽，观看视频流畅无卡顿
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                安全加密
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                采用先进加密技术，保护您的网络隐私和数据安全
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5 text-green-600" />
                完全免费
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                无需注册，无需付费，一键订阅即可使用全部功能
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
