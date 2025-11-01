"use client"

import { useTranslations } from "next-intl"
import { MonitorDashboard } from "@/components/monitor/monitor-dashboard"

export default function MonitorPage() {
  const t = useTranslations("monitor")

  return (
    <div className="min-h-screen bg-background pt-20">
      <MonitorDashboard />
       {/*  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>
         
        </div>*/}
    </div> 
  )
}
