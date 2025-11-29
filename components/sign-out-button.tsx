'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'

const SignOutButton = () => {
  const t = useTranslations('login')
  return (
    <div className="flex items-center gap-2" onClick={() => signOut()}>
      <LogOut />
      {t('signOut')}
    </div>
  )
}

export default SignOutButton
