import { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

export default async function AdminLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const s = await auth()
  if (process.env.NODE_ENV === 'production' && !process.env.PROJECT_ADMIN_ID?.split(',').includes(s?.user?.id ?? '')) {
    redirect(`/${locale}`)
  }
  return (<div className="mt-10">{children}</div>)
}
