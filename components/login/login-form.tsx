'use client'

import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const t = useTranslations('login.form')
  const [isLoading, setIsLoading] = useState({
    google: false,
    github: false,
    email: false
  })

  const handleSignIn = async (provider: 'google' | 'github' | 'resend') => {
    setIsLoading((prev) => ({ ...prev, [provider]: true }))
    try {
      await signIn(provider)
    } catch (error) {
      console.error(`${t('errorMessage', { provider })}:`, error)
    } finally {
      setIsLoading((prev) => ({ ...prev, [provider]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => handleSignIn('google')} disabled={isLoading.google} variant="outline" className="w-full">
        {isLoading.google ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.9c2.26-2.09 3.52-5.17 3.52-8.8z"
            />
            <path
              fill="#34A853"
              d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-2.98c-1.08.72-2.45 1.16-4.03 1.16-3.09 0-5.71-2.08-6.65-4.9h-4.04v3.07c1.97 3.9 6.02 6.56 10.69 6.56z"
            />
            <path
              fill="#FBBC05"
              d="M5.605 14.37c-.25-.72-.38-1.48-.38-2.27s.14-1.55.38-2.27v-3.07h-4.04c-.8 1.57-1.27 3.33-1.27 5.34s.46 3.77 1.27 5.34l4.04-3.07z"
            />
            <path
              fill="#EA4335"
              d="M12.255 4.93c1.73 0 3.28.59 4.51 1.74l3.45-3.45c-2.07-1.94-4.78-3.13-7.96-3.13-4.67 0-8.72 2.66-10.69 6.56l4.04 3.07c.94-2.82 3.56-4.79 6.65-4.79z"
            />
          </svg>
        )}
        {t('continueWithGoogle')}
      </Button>

      <Button onClick={() => handleSignIn('github')} disabled={isLoading.github} variant="outline" className="w-full">
        {isLoading.github ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        )}
        {t('continueWithGithub')}
      </Button>
    </div>
  )
}