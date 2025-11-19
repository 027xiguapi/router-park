"use client"

import { useState, useMemo, useEffect } from "react"
import QRCode from "qrcode"
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
  Download,
  Lock
} from "lucide-react"
import Image from "next/image"
import { Link } from '@/i18n/navigation'
import { useTranslations } from "next-intl"
import { useUser } from "@/contexts/user-context"

interface VPNConfig {
  id: string
  name: string
  url: string
  subscriptionUrl: string
  inviteLink?: string | null
  description?: string | null
}

export function FreeVPN() {
  const t = useTranslations("freeVpn")
  const { checkIsLoggedIn, isAuthenticated } = useUser()
  const [copied, setCopied] = useState(false)
  const [qrCodeSrc, setQrCodeSrc] = useState('')
  const [vpnConfig, setVpnConfig] = useState<VPNConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // 从 API 获取 VPN 配置
  useEffect(() => {
    const fetchVPNConfig = async () => {
      try {
        const response = await fetch('/api/vpns?firstOnly=true')
        const result = await response.json()

        if (result.success && result.data) {
          setVpnConfig(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch VPN config:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVPNConfig()
  }, [])

  // 生成二维码数据URL
  useEffect(() => {
    if (!vpnConfig) return

    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(vpnConfig.subscriptionUrl, {
          width: 240,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeSrc(dataUrl)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
        setQrCodeSrc('')
      }
    }

    generateQRCode()
  }, [vpnConfig])

  const handleCopy = async () => {
    if (!checkIsLoggedIn()) {
      return
    }

    if (!vpnConfig) return

    try {
      await navigator.clipboard.writeText(vpnConfig.subscriptionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">加载中...</p>
          </div>
        </div>
      </section>
    )
  }

  // 如果没有 VPN 配置，不显示任何内容
  if (!vpnConfig) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="h-12 w-12 text-green-600" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 bg-clip-text text-transparent">
              {t('title')}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* 主卡片 */}
        <Card className="max-w-5xl mx-auto border-2 border-green-500/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  {t('mainTitle')}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {t('mainDescription')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-500 text-white hover:bg-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  {t('badges.highSpeed')}
                </Badge>
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                  <Globe className="h-3 w-3 mr-1" />
                  {t('badges.stable')}
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
                    {t('subscription.title')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          readOnly
                          value={isAuthenticated ? vpnConfig.subscriptionUrl : "••••••••••••••••••••••••••"}
                          className={`font-mono text-sm ${isAuthenticated ? 'bg-muted' : 'bg-muted blur-sm select-none pointer-events-none'}`}
                        />
                        {!isAuthenticated && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="shrink-0 border-green-500/50 hover:bg-green-500/10"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-600" />
                            {t('subscription.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            {t('subscription.copyButton')}
                          </>
                        )}
                      </Button>
                    </div>
                    {!isAuthenticated && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                        <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                          请先登录后才能查看和复制订阅地址
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {t('subscription.placeholder')}
                    </p>
                  </div>
                </div>

                {/* 使用步骤 */}
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">
                    {t('steps.title')}
                  </h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">1.</span>
                      <span>{t('steps.step1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">2.</span>
                      <span>{t('steps.step2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">3.</span>
                      <span>{t('steps.step3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 shrink-0">4.</span>
                      <span>{t('steps.step4')}</span>
                    </li>
                  </ol>
                </div>

                {/* 邀请链接按钮 */}
                {vpnConfig.inviteLink && (
                  <Link
                    href={vpnConfig.inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      {t('inviteButton')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* 右侧：二维码 */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-2 border-green-200 dark:border-green-800">
                  <div className="mb-4 text-center">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                      {t('qrCode.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('qrCode.description')}
                    </p>
                  </div>
                  <div className="relative w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300 dark:border-green-700">
                    {qrCodeSrc ? (
                      <>
                        <Image
                          src={qrCodeSrc}
                          alt="VPN订阅二维码"
                          width={240}
                          height={240}
                          className={`rounded ${!isAuthenticated ? 'blur-md' : ''}`}
                          onError={(e) => {
                            // 如果图片加载失败，显示占位符
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="text-center p-4">
                                  <div class="text-4xl mb-2">📱</div>
                                  <p class="text-sm text-muted-foreground">${t('qrCode.placeholder')}</p>
                                </div>
                              `
                            }
                          }}
                        />
                        {!isAuthenticated && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 dark:bg-black/30 rounded-lg">
                            <Lock className="h-12 w-12 text-white drop-shadow-lg mb-2" />
                            <p className="text-sm font-semibold text-white drop-shadow-lg">需要登录查看</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2 animate-pulse">⏳</div>
                        <p className="text-sm text-muted-foreground">生成二维码中...</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    {t('qrCode.scanWith')}
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
                    {t('notice.title')}
                  </p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• {t('notice.item1')}</li>
                    <li>• {t('notice.item2')}</li>
                    <li>• {t('notice.item3')}</li>
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
                {t('features.speed.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('features.speed.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                {t('features.security.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('features.security.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5 text-green-600" />
                {t('features.free.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('features.free.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
