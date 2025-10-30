"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, FileSpreadsheet, BarChart3 } from "lucide-react"

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

interface ResultsTableProps {
  results: KeywordResult[]
  stats: QueryStats
}

export function ResultsTable({ results, stats }: ResultsTableProps) {
  const sortedResults = [...results].sort((a, b) => {
    const volA = a.avgMonthlySearches === 'N/A' ? -1 : parseInt(String(a.avgMonthlySearches))
    const volB = b.avgMonthlySearches === 'N/A' ? -1 : parseInt(String(b.avgMonthlySearches))
    return volB - volA
  })

  const exportToTxt = () => {
    const timestamp = new Date().toLocaleString('zh-CN')
    let content = '='.repeat(80) + '\n'
    content += '关键词搜索量查询结果\n'
    content += `查询时间: ${timestamp}\n`
    content += `共查询 ${sortedResults.length} 个关键词\n`
    content += '='.repeat(80) + '\n\n'
    content += '关键词'.padEnd(30) + ' ' + '月均搜索量'.padEnd(15) + ' ' + '平均CPC'.padEnd(12) + ' ' + '竞争度'.padEnd(10) + '\n'
    content += '-'.repeat(80) + '\n'

    sortedResults.forEach(item => {
      const kw = item.keyword.padEnd(30)
      const vol = String(item.avgMonthlySearches).padEnd(15)
      const cpc = (item.averageCpc !== 'N/A' ? '$' + item.averageCpc : 'N/A').padEnd(12)
      const comp = String(item.competitionIndex).padEnd(10)
      content += `${kw} ${vol} ${cpc} ${comp}\n`
    })

    content += '\n' + '='.repeat(80) + '\n'

    downloadFile(content, `keyword_results_${Date.now()}.txt`, 'text/plain')
  }

  const exportToCsv = () => {
    let content = '\uFEFF' // UTF-8 BOM for Excel
    content += '关键词,月均搜索量,平均CPC,竞争度指数,竞争级别\n'

    sortedResults.forEach(item => {
      content += `"${item.keyword}",${item.avgMonthlySearches},${item.averageCpc},${item.competitionIndex},${item.competition}\n`
    })

    downloadFile(content, `keyword_results_${Date.now()}.csv`, 'text/csv')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isNA = (value: any) => {
    return value === 'N/A' || value === null || value === undefined
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              查询结果
            </CardTitle>
            <CardDescription className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">总数: {stats.total}</Badge>
              <Badge variant="default" className="bg-green-500">成功: {stats.success}</Badge>
              <Badge variant="destructive">失败: {stats.failed}</Badge>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToTxt} variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              导出 TXT
            </Button>
            <Button onClick={exportToCsv} variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              导出 CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="min-w-[200px]">关键词</TableHead>
                <TableHead>月均搜索量</TableHead>
                <TableHead>平均 CPC</TableHead>
                <TableHead>竞争度指数</TableHead>
                <TableHead>竞争级别</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                sortedResults.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium max-w-[300px] break-words">
                      {item.keyword}
                    </TableCell>
                    <TableCell className={isNA(item.avgMonthlySearches) ? 'text-muted-foreground italic' : 'font-semibold text-purple-600'}>
                      {isNA(item.avgMonthlySearches)
                        ? 'N/A'
                        : Number(item.avgMonthlySearches).toLocaleString()}
                    </TableCell>
                    <TableCell className={isNA(item.averageCpc) ? 'text-muted-foreground italic' : 'text-green-600'}>
                      {isNA(item.averageCpc) ? 'N/A' : `$${item.averageCpc}`}
                    </TableCell>
                    <TableCell className={isNA(item.competitionIndex) ? 'text-muted-foreground italic' : 'text-orange-600'}>
                      {isNA(item.competitionIndex) ? 'N/A' : item.competitionIndex}
                    </TableCell>
                    <TableCell className={isNA(item.competition) ? 'text-muted-foreground italic' : ''}>
                      {item.competition}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
