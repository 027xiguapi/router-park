import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import type { ServiceStatus } from "./types"

interface ServiceCardProps {
  service: ServiceStatus
}

export function ServiceCard({ service }: ServiceCardProps) {
  const isOnline = service.status === "online"

  return (
    <Card className="border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-accent/50 hover:shadow-md dark:border-border dark:bg-card/50 dark:backdrop-blur">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">{service.name}</h3>
        <Badge
          variant={isOnline ? "default" : "destructive"}
          className={
            isOnline
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20"
              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
          }
        >
          {isOnline ? "在线" : "离线"}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            {service.url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {service.inviteLink && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
            asChild
          >
            <a href={service.inviteLink} target="_blank" rel="noopener noreferrer">
              邀请链接
            </a>
          </Button>
        )}

        {service.error && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            {service.error}
          </Button>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm dark:border-border">
          <span className="text-gray-600 dark:text-muted-foreground">响应时间</span>
          <span
            className={`font-mono font-semibold ${
              isOnline
                ? "text-emerald-600 dark:text-emerald-500"
                : "text-red-600 dark:text-red-500"
            }`}
          >
            {service.responseTime} ms
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-muted-foreground">最后检测</span>
          <span className="font-mono text-gray-900 dark:text-foreground">{service.lastCheck}</span>
        </div>
      </div>
    </Card>
  )
}
