'use client'

import { LogIn } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import { useUser } from '@/contexts/user-context'
import SignOutButton from '@/components/sign-out-button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface LoginModalProps {
  showIcon?: boolean
}

export default function LoginModal({ showIcon = true }: LoginModalProps) {
  const { isAuthenticated, showLoginModal } = useUser()
  const { data: session, status } = useSession()
  const t = useTranslations('login')

  if (status === 'loading') return null

  if (isAuthenticated) {
    return (
      <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full p-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session?.user?.image || ''}
                alt={session?.user?.name || 'User'}
              />
              <AvatarFallback>
                {session?.user?.name?.[0] || session?.user?.email?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              {session?.user?.name && (
                <p className="font-medium">{session.user.name}</p>
              )}
              {session?.user?.email && (
                <p className="text-muted-foreground truncate text-xs">
                  {session.user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
            <SignOutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </>
    )
  }

  return (
    <Button variant="outline" onClick={showLoginModal}>
      {showIcon && <LogIn className="mr-2 h-4 w-4" />}
      {t('login')}
    </Button>
  )
}
