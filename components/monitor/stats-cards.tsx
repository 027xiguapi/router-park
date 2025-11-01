import { Card } from "@/components/ui/card"

interface StatsCardsProps {
  totalServices: number
  lastUpdate: string
  t: (key: string) => string
}

export function StatsCards({ totalServices, lastUpdate, t }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-border bg-card/50 p-6 backdrop-blur">
        <div className="text-sm text-muted-foreground">{t('stats.totalSites')}</div>
        <div className="mt-2 text-4xl font-bold">{totalServices}</div>
      </Card>

      <Card className="border-border bg-card/50 p-6 backdrop-blur">
        <div className="text-sm text-muted-foreground">{t('stats.lastUpdate')}</div>
        <div className="mt-2 text-2xl font-bold">{lastUpdate}</div>
      </Card>
    </div>
  )
}
