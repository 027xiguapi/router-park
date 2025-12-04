'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function InviteCodeHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const affCode = searchParams.get('aff')
    
    if (affCode) {
      localStorage.setItem('pendingInviteCode', affCode)
    }
  }, [searchParams])

  return null
}
