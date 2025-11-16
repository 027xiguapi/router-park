'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { createContext, useContext, useState, ReactNode } from 'react'

import LoginForm from '@/components/login/login-form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface UserContextType {
  // Authentication
  isAuthenticated: boolean
  userId: string | undefined

  // Login dialog
  isLoginModalOpen: boolean
  showLoginModal: () => void
  hideLoginModal: () => void

  // Actions
  login: () => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('userProvider')
  const { data: session, status } = useSession()
  const userId = session?.user?.id

  // Login modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const isAuthenticated = status === 'authenticated' && !!userId

  // Dialog control functions
  const showLoginModal = () => setIsLoginModalOpen(true)
  const hideLoginModal = () => setIsLoginModalOpen(false)

  // Authentication actions
  const login = async () => {
    showLoginModal()
  }

  const logout = async () => {
    await signOut()
  }

  return (
    <UserContext.Provider
      value={{
        // Authentication
        isAuthenticated,
        userId,

        // Login dialog
        isLoginModalOpen,
        showLoginModal,
        hideLoginModal,

        // Actions
        login,
        logout
      }}
    >
      {children}

      {/* Login modal */}
      <LoginModalWrapper open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </UserContext.Provider>
  )
}

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Wrapper component for the login modal
function LoginModalWrapper({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('userProvider.loginModal')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">{t('title')}</DialogTitle>
          <DialogDescription className="text-center">{t('description')}</DialogDescription>
        </DialogHeader>
        <LoginForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
