import { Card } from "@/components/ui/card"

interface StatsCardsProps {
  totalServices: number
  lastUpdate: string
}

export function StatsCards({ totalServices, lastUpdate }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-border bg-card/50 p-6 backdrop-blur">
        <div className="text-sm text-muted-foreground">总站点数</div>
        <div className="mt-2 text-4xl font-bold">{totalServices}</div>
      </Card>

      <Card className="border-border bg-card/50 p-6 backdrop-blur">
        <div className="text-sm text-muted-foreground">最后更新</div>
        <div className="mt-2 text-2xl font-bold">{lastUpdate}</div>
      </Card>
    </div>
  )
}
