import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, DollarSign, Users, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Image from "next/image"

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ aff?: string }>
}) {
  const { locale } = await params
  const { aff } = await searchParams
  const t = await getTranslations('login.page')
  const tLogin = await getTranslations('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 pt-20 pb-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 flex items-center justify-center mb-4">
            <Image src='/icon.svg' width="28" height="28" alt='logo' className="sm:w-28 sm:h-28" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
            {t('welcomeBack')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {aff && (
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-orange-500/5 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">🎉 {t('inviteReceived')}</h3>
                    <Badge variant="secondary" className="text-xs">{t('limitedOffer')}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>{t('youWillGet')} <span className="font-bold text-primary">$100</span> {t('signupBonus')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{t('inviterWillGet')} <span className="font-bold text-primary">$20</span> {t('inviteReward')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 登录卡片 */}
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl">{tLogin('modal.triggerText')}</CardTitle>
            <CardDescription>{tLogin('modal.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm inviteCode={aff} />
          </CardContent>
        </Card>

        {/* 注册奖励说明 */}
        <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-muted">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gift className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">{t('newUserBenefits')}</h4>
              </div>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('signupBonusTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('signupBonusDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('inviteRewardTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('inviteRewardDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('balanceUsageTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('balanceUsageDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <p className="text-center text-xs text-muted-foreground">
          {t('termsPrefix')}
          <a href="/terms" className="text-primary hover:underline mx-1">{t('termsOfService')}</a>
          {t('and')}
          <a href="/privacy" className="text-primary hover:underline mx-1">{t('privacyPolicy')}</a>
        </p>
      </div>
    </div>
  )
}
