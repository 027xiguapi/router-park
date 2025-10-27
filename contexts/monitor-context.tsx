"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface MonitorContextType {
  refreshMonitor: (() => void) | null
  setRefreshMonitor: (fn: (() => void) | null) => void
}

const MonitorContext = createContext<MonitorContextType>({
  refreshMonitor: null,
  setRefreshMonitor: () => {},
})

export function MonitorProvider({ children }: { children: ReactNode }) {
  const [refreshMonitor, setRefreshMonitor] = useState<(() => void) | null>(null)

  return <MonitorContext.Provider value={{ refreshMonitor, setRefreshMonitor }}>{children}</MonitorContext.Provider>
}

export function useMonitor() {
  const context = useContext(MonitorContext)
  if (!context) {
    throw new Error("useMonitor must be used within MonitorProvider")
  }
  return context
}
