import { MonitorDashboard } from "@/components/monitor/monitor-dashboard"
import {FreeAPIKeys} from "@/components/free-api-keys";
import { APIProvidersTable } from "@/components/api-providers-table";

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
        <h1 className="text-center dark:text-foreground mb-2 text-5xl font-bold text-gray-900">API中转站聚合网站汇总</h1>
        <MonitorDashboard
            locale={locale}
            currentPage={currentPage}
            activeTab={activeTab}
            searchQuery={searchQuery}
        />
        <APIProvidersTable />
        <FreeAPIKeys />
    </div>
  )
}
