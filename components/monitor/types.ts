export interface ServiceStatus {
  id: string
  name: string
  url: string
  status: "online" | "offline"
  responseTime: number
  lastCheck: string
  inviteLink?: string
  likes?: number
  error?: string
}
