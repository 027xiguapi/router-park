"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { KeywordInput } from "@/components/keyword-tool/keyword-input"
import { QuerySettings } from "@/components/keyword-tool/query-settings"
import { ResultsTable } from "@/components/keyword-tool/results-table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Trash2 } from "lucide-react"

interface KeywordResult {
  keyword: string
  avgMonthlySearches: string | number
  averageCpc: string | number
  competitionIndex: string | number
  competition: string
}

interface QueryStats {
  total: number
  success: number
  failed: number
}

export default function KeywordToolPage() {
  const t = useTranslations("pages.keywordTool")
  const [keywords, setKeywords] = useState<string>("")
  const [countryId, setCountryId] = useState<string>("global")
  const [batchSize, setBatchSize] = useState<number>(986)
  const [delay, setDelay] = useState<number>(1)
  const [isQuerying, setIsQuerying] = useState<boolean>(false)
  const [results, setResults] = useState<KeywordResult[]>([])
  const [stats, setStats] = useState<QueryStats>({ total: 0, success: 0, failed: 0 })
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [statusType, setStatusType] = useState<"info" | "success" | "error" | "warning">("info")

  const showStatus = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    setStatusMessage(message)
    setStatusType(type)
  }

  const clearStatus = () => {
    setStatusMessage("")
  }

  const getKeywordList = (): string[] => {
    const text = keywords.trim()
    if (!text) return []
    const keywordList = text.split('\n').map(k => k.trim()).filter(k => k.length > 0)
    return [...new Set(keywordList)]
  }

  const queryKeywords = async (keywordList: string[], geoId: string) => {
    const API_URL = 'https://insight.gotrends.app/kw/gethistorymetric'

    const buildRequestBody = (keywords: string[]) => ({
      keywords,
      includeAdultKeywords: true,
      geoTargetConstants: geoId && geoId !== "global" ? [`geoTargetConstants/${geoId}`] : [],
      aggregateMetrics: {
        aggregateMetricTypes: ['DEVICE']
      },
      historicalMetricsOptions: {
        includeAverageCpc: true,
        yearMonthRange: {
          start: { year: '2023', month: 'JULY' },
          end: { year: '2023', month: 'JULY' }
        }
      },
      language: 'languageConstants/1000'
    })

    try {
      const requestBody = buildRequestBody(keywordList)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (response.status === 200) {
        return await response.json()
      } else if (response.status === 429) {
        throw new Error('请求过于频繁 (429)，请稍后重试')
      } else {
        throw new Error(`请求失败，状态码: ${response.status}`)
      }
    } catch (error) {
      throw error
    }
  }

  const parseResults = (jsonData: any): Record<string, KeywordResult> => {
    const resultsMap: Record<string, KeywordResult> = {}

    if (!jsonData || !jsonData.results) {
      return resultsMap
    }

    for (const item of jsonData.results) {
      const kw = item.text || ''
      const metrics = item.keywordMetrics || {}

      if (kw && metrics) {
        resultsMap[kw] = {
          keyword: kw,
          avgMonthlySearches: metrics.avgMonthlySearches || 'N/A',
          averageCpc: metrics.averageCpcMicros
            ? (parseFloat(metrics.averageCpcMicros) / 10000000).toFixed(2)
            : 'N/A',
          competitionIndex: metrics.competitionIndex || 'N/A',
          competition: metrics.competition || 'N/A'
        }
      }
    }

    return resultsMap
  }

  const handleQuery = async () => {
    const keywordList = getKeywordList()

    if (keywordList.length === 0) {
      showStatus(t('statusMessages.enterAtLeastOneKeyword'), 'warning')
      return
    }

    clearStatus()
    setIsQuerying(true)
    setResults([])

    const totalBatches = Math.ceil(keywordList.length / batchSize)
    let processedCount = 0
    const allResults: KeywordResult[] = []

    try {
      for (let i = 0; i < keywordList.length; i += batchSize) {
        const batch = keywordList.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1

        showStatus(t('statusMessages.querying', { batchNumber, totalBatches, count: batch.length }), 'info')

        try {
          const jsonData = await queryKeywords(batch, countryId)
          const batchResults = parseResults(jsonData)

          for (const [keyword, data] of Object.entries(batchResults)) {
            allResults.push(data)
          }

          processedCount += Object.keys(batchResults).length

          if (i + batchSize < keywordList.length) {
            await new Promise(resolve => setTimeout(resolve, delay * 1000))
          }
        } catch (error: any) {
          console.error(`第 ${batchNumber} 批查询失败:`, error)
          showStatus(t('statusMessages.batchFailed', { batchNumber, error: error.message }), 'error')
        }
      }

      setIsQuerying(false)
      setResults(allResults)
      setStats({
        total: keywordList.length,
        success: processedCount,
        failed: keywordList.length - processedCount
      })
      showStatus(t('statusMessages.queryCompleted', { count: processedCount, total: keywordList.length }), 'success')
    } catch (error: any) {
      setIsQuerying(false)
      showStatus(t('statusMessages.queryError', { error: error.message }), 'error')
    }
  }

  const handleClear = () => {
    if (isQuerying) {
      if (!confirm(t('statusMessages.queryInProgress'))) {
        return
      }
    }
    setKeywords('')
    clearStatus()
    setResults([])
    setStats({ total: 0, success: 0, failed: 0 })
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-background rounded-xl shadow-2xl overflow-hidden border border-border">
          {/* Header */}
          <div className="bg-accent text-accent-foreground p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-accent-foreground/80">{t('description')}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <KeywordInput
              value={keywords}
              onChange={setKeywords}
              onQueryShortcut={handleQuery}
            />

            <QuerySettings
              countryId={countryId}
              batchSize={batchSize}
              delay={delay}
              onCountryChange={setCountryId}
              onBatchSizeChange={setBatchSize}
              onDelayChange={setDelay}
            />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleQuery}
                disabled={isQuerying}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                {isQuerying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('buttons.clearing')}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    {t('buttons.startQuery')}
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                {t('buttons.clear')}
              </Button>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <Alert variant={statusType === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}

            {/* Loading Indicator */}
            {isQuerying && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
                <p className="mt-4 text-muted-foreground">{t('statusMessages.queryingPleaseWait')}</p>
              </div>
            )}

            {/* Results Table */}
            {results.length > 0 && (
              <ResultsTable results={results} stats={stats} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
