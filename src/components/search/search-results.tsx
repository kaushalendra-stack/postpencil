'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { FileText, User, Tag, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

const TABS = [
  { value: 'all', label: 'All', icon: FileText },
  { value: 'resources', label: 'Resources', icon: FileText },
  { value: 'users', label: 'Users', icon: User },
  { value: 'tags', label: 'Tags', icon: Tag },
]

export function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const tab = searchParams.get('tab') || 'all'

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, tab],
    queryFn: () =>
      fetch(`/api/search?q=${encodeURIComponent(query)}&tab=${tab}`).then((res) =>
        res.json()
      ),
    enabled: !!query,
  })

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/search?${params.toString()}`)
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-sm text-muted-foreground">
          Search for resources, users, or tags
        </p>
      </div>
    )
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList className="w-full justify-start">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            <t.icon className="mr-1.5 h-3.5 w-3.5" />
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all">
        <SearchTabContent isLoading={isLoading} data={data} type="all" />
      </TabsContent>
      <TabsContent value="resources">
        <SearchTabContent isLoading={isLoading} data={data} type="resources" />
      </TabsContent>
      <TabsContent value="users">
        <SearchTabContent isLoading={isLoading} data={data} type="users" />
      </TabsContent>
      <TabsContent value="tags">
        <SearchTabContent isLoading={isLoading} data={data} type="tags" />
      </TabsContent>
    </Tabs>
  )
}

function SearchTabContent({
  isLoading,
  data,
  type,
}: {
  isLoading: boolean
  data: any
  type: string
}) {
  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const items = data?.results ?? []

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">No results found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-4">
      {items.map((item: any) => {
        if (item.type === 'post') {
          return (
            <Link key={item.id} href={`/post/${item.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.user?.username}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        }

        if (item.type === 'user') {
          return (
            <Link key={item.id} href={`/profile/${item.username}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.image ?? undefined} />
                    <AvatarFallback>
                      {item.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.name || item.username}</p>
                    <p className="text-xs text-muted-foreground">@{item.username}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        }

        if (item.type === 'tag') {
          return (
            <Link key={item.id} href={`/search?q=${item.name}&tab=resources`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">#{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.postCount ?? 0} posts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        }

        return null
      })}
    </div>
  )
}
