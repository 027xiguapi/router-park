import { MonitorDashboard } from "@/components/monitor/monitor-dashboard"

export default async function MonitorPage({
                                        params,
                                        searchParams
                                    }: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ page?: string; tab?: string; search?: string }>
}) {
    const { locale } = await params
    const { page, tab, search } = await searchParams
    const currentPage = page ? parseInt(page) : 1
    const activeTab = (tab as 'latest' | 'my-likes' | 'most-liked') || 'latest'
    const searchQuery = search || ''

  return (
    <div className="min-h-screen bg-background pt-20">
        <MonitorDashboard
            locale={locale}
            currentPage={currentPage}
            activeTab={activeTab}
            searchQuery={searchQuery}
        />
    </div>
  )
}
