'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

export function AutoApplyInvite() {
  const { data: session, status } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const applyPendingInviteCode = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return

      const pendingCode = localStorage.getItem('pendingInviteCode')
      if (!pendingCode) return

      try {
        const response = await fetch('/api/invite/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: pendingCode })
        })

        if (response.ok) {
          toast({
            title: '邀请码已应用',
            description: '您的邀请人将获得 $20 奖励！'
          })
        }
      } catch (error) {
        console.error('Failed to apply invite code:', error)
      } finally {
        // 无论成功失败，都清除 localStorage 中的邀请码
        localStorage.removeItem('pendingInviteCode')
      }
    }

    applyPendingInviteCode()
  }, [session, status, toast])

  return null
}
