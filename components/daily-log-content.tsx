'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Activity,
  Key,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  ThumbsUp,
  Shield,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {getTranslations} from "next-intl/server";
import {useTranslations} from "next-intl";

interface RouterData {
  id: string
  name: string
  url: string
  status: 'online' | 'offline'
  responseTime: number
  lastCheck: number
  inviteLink: string | null
  isVerified: boolean
  likes: number
  createdBy: string | null
  updatedBy: string | null
  createdAt: number
  updatedAt: number
}

interface FreeKeyData {
  id: string
  keyValues: string
  keyType: 'claude' | 'llm'
  status: 'active' | 'inactive' | 'exhausted'
  createdBy: string | null
  updatedBy: string | null
  createdAt: number
  updatedAt: number
}

interface DailySummaryData {
  date: string
  routers: {
    total: number
    online: number
    offline: number
    newToday: RouterData[]
  }
  freeKeys: {
    total: number
    active: number
    claude: number
    llm: number
    newToday: FreeKeyData[]
  }
}

interface DailySummaryContentProps {
  data: DailySummaryData
  locale: string
}

export function DailyLogContent({ data, locale }: DailySummaryContentProps) {
  const t = useTranslations("dailyLog")
  const { date, routers, freeKeys } = data

  const dateObj = new Date(date)
  const formattedDate = dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const parseKeyValues = (keyValuesJson: string): string[] => {
    try {
      return JSON.parse(keyValuesJson) as string[]
    } catch {
      return []
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">{t('title')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              📊 {formattedDate}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')} <strong>{formattedDate}</strong> {t('subtitleSuffix')}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Routers Stats */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t('routersSection.title')}
                  </CardTitle>
                  <Badge variant="secondary">{routers.total} {t('routersSection.units.items')}</Badge>
                </div>
                <CardDescription>{t('routersSection.overview')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {routers.online}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('routersSection.online')}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {routers.offline}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <XCircle className="h-3 w-3" />
                      {t('routersSection.offline')}
                    </div>
                  </div>
                  <div className="col-span-2 text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {routers.newToday.length}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Sparkles className="h-3 w-3" />
                      {t('routersSection.newToday')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Free Keys Stats */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    {t('freeKeysSection.title')}
                  </CardTitle>
                  <Badge variant="secondary">{freeKeys.total} {t('freeKeysSection.units.groups')}</Badge>
                </div>
                <CardDescription>{t('freeKeysSection.overview')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {freeKeys.active}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('freeKeysSection.active')}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {freeKeys.newToday.length}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Sparkles className="h-3 w-3" />
                      {t('freeKeysSection.newToday')}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {freeKeys.claude}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('freeKeysSection.claude')}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {freeKeys.llm}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('freeKeysSection.llm')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Routers Today */}
          <Card className="mb-8 border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t('routersSection.newTodayTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {routers.newToday.length > 0 ? (
                <div className="space-y-4">
                  {routers.newToday.map((router, index) => (
                    <div
                      key={router.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                            <h3 className="font-bold text-lg">{router.name}</h3>
                            {router.status === 'online' ? (
                              <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t('routersSection.statusOnline')}
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                                <XCircle className="h-3 w-3 mr-1" />
                                {t('routersSection.statusOffline')}
                              </Badge>
                            )}
                            {router.isVerified && (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                                <Shield className="h-3 w-3 mr-1" />
                                {t('routersSection.verified')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {router.responseTime}ms
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {router.likes}
                            </div>
                          </div>
                          <a
                            href={router.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                          >
                            {router.url}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </div>
                        {router.inviteLink && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={router.inviteLink} target="_blank" rel="noopener noreferrer">
                              {t('routersSection.visitLink')}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('routersSection.noNewItems')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Keys Today */}
          <Card className="mb-8 border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t('freeKeysSection.newTodayTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {freeKeys.newToday.length > 0 ? (
                <div className="space-y-4">
                  {freeKeys.newToday.map((key, index) => {
                    const keys = parseKeyValues(key.keyValues)
                    const typeLabel = key.keyType === 'claude' ? t('freeKeysSection.typeClaude') : t('freeKeysSection.typeLlm')
                    let statusLabel = t('freeKeysSection.statusActive')
                    let statusColor = 'green'
                    if (key.status === 'inactive') {
                      statusLabel = t('freeKeysSection.statusInactive')
                      statusColor = 'orange'
                    }
                    if (key.status === 'exhausted') {
                      statusLabel = t('freeKeysSection.statusExhausted')
                      statusColor = 'red'
                    }

                    return (
                      <div
                        key={key.id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                            <h3 className="font-bold">{typeLabel} {t('freeKeysSection.units.groups')}</h3>
                            <Badge
                              variant="secondary"
                              className={`bg-${statusColor}-500/10 text-${statusColor}-700 dark:text-${statusColor}-400 border-${statusColor}-500/20`}
                            >
                              {statusLabel}
                            </Badge>
                          </div>
                          <Badge variant="outline">{keys.length} {t('routersSection.units.items')}</Badge>
                        </div>
                        {keys.length > 0 && keys.length <= 3 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">{t('freeKeysSection.keyList')}:</div>
                            {keys.map((k, i) => {
                              const maskedKey = k.length > 20 ? `${k.substring(0, 10)}...${k.substring(k.length - 10)}` : k
                              return (
                                <code key={i} className="block text-xs bg-muted p-2 rounded break-all">
                                  {maskedKey}
                                </code>
                              )
                            })}
                          </div>
                        )}
                        {keys.length > 3 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">{t('freeKeysSection.keyPreview')}:</div>
                            {keys.slice(0, 3).map((k, i) => {
                              const maskedKey = k.length > 20 ? `${k.substring(0, 10)}...${k.substring(k.length - 10)}` : k
                              return (
                                <code key={i} className="block text-xs bg-muted p-2 rounded break-all">
                                  {maskedKey}
                                </code>
                              )
                            })}
                            <div className="text-sm text-muted-foreground italic">
                              {t('freeKeysSection.moreKeys', { count: keys.length - 3 })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('freeKeysSection.noNewItems')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                💡 {t('notesSection.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('notesSection.dataDate')}{formattedDate}</li>
                <li>• {t('notesSection.autoCheck')}</li>
                <li>• {t('notesSection.realTimeUpdate')}</li>
                <li>• {t('notesSection.autoGenerate')}</li>
              </ul>
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground italic text-center">
                {t('notesSection.lastUpdate')} {new Date().toLocaleString(locale)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
