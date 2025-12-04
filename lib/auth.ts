import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'

import { FREE_USER_TOKENS } from '@/config/token'
import { createDb } from '@/lib/db'

import { accounts, sessions, users, userUsage, verificationTokens } from './db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth(() => {
  const db = createDb()

  return {
    secret: process.env.AUTH_SECRET,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens
    }),
    providers: [Google, GitHub],
    session: {
      strategy: 'jwt'
    },
    callbacks: {
      jwt: async ({ token, user }) => {
        if (user) {
          token.id = user.id
        }
        return token
      },
      session: async ({ session, token }) => {
        if (token && session.user) {
          session.user.id = token.id as string
        }
        return session
      }
    },
    events: {
      createUser: async ({ user }) => {
        await db.insert(userUsage).values({
          userId: user.id!,
          usedTokens: 0,
          totalTokens: FREE_USER_TOKENS
        })
        
        // 动态导入以避免循环依赖
        const { createInviteCodeForUser, handleSignupBonus } = await import('@/lib/db/invitations')
        
        // 为新用户生成邀请码
        await createInviteCodeForUser(user.id!)
        
        // 发放注册奖励
        await handleSignupBonus(user.id!)
      }
    }
  }
})

/**
 * 检查用户是否是管理员
 * @param userId - 可选，用户 ID。如果不传，则检查当前登录用户
 * @returns 是否是管理员
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  // 如果没有传入 userId，则获取当前 session 的用户 ID
  let checkUserId = userId

  if (!checkUserId) {
    const session = await auth()
    checkUserId = session?.user?.id
  }

  // 如果没有用户 ID，返回 false
  if (!checkUserId) {
    return false
  }

  // 在生产环境下，检查用户 ID 是否在管理员列表中
  if (process.env.NODE_ENV === 'production') {
    const adminIds = process.env.PROJECT_ADMIN_ID?.split(',') || []
    return adminIds.includes(checkUserId)
  }

  // 开发环境下，所有登录用户都是管理员
  return true
}
