import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notFound } from 'next/navigation'
import { UserRouters } from '@/components/user-routers'
import { createDb } from '@/lib/db'
import { getUserById } from '@/lib/db/users'

export default async function UserProfile({ params }: any) {
  const { id: userId, locale } = await params

  // 根据 userId 获取用户信息
  const db = createDb()
  const user = await getUserById(db, userId)

  // 如果用户不存在，返回 404
  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 pt-20 pb-16">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-24 w-24 mb-4">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || 'User'}
              />
              <AvatarFallback>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">
              {user.name || 'Unnamed User'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="submitted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submitted">我的提交</TabsTrigger>
            <TabsTrigger value="liked">我的点赞</TabsTrigger>
          </TabsList>
          <TabsContent value="submitted" className="mt-6">
            <UserRouters userId={userId} type="created" />
          </TabsContent>
          <TabsContent value="liked" className="mt-6">
            <UserRouters userId={userId} type="liked" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
