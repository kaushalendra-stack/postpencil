'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  TrendingUp,
  Hash,
  BookOpen,
  Code,
  Beaker,
  GraduationCap,
  PenTool,
  Calculator,
  Microscope,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from './search-bar'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

const CATEGORIES = [
  { label: 'CS & IT', icon: Code, color: 'bg-blue-500/10 text-blue-500' },
  { label: 'Science', icon: Beaker, color: 'bg-green-500/10 text-green-500' },
  { label: 'Engineering', icon: GraduationCap, color: 'bg-orange-500/10 text-orange-500' },
  { label: 'Writing', icon: PenTool, color: 'bg-purple-500/10 text-purple-500' },
  { label: 'Math', icon: Calculator, color: 'bg-red-500/10 text-red-500' },
  { label: 'Biology', icon: Microscope, color: 'bg-teal-500/10 text-teal-500' },
  { label: 'Business', icon: Briefcase, color: 'bg-yellow-500/10 text-yellow-500' },
  { label: 'All', icon: BookOpen, color: 'bg-primary/10 text-primary' },
]

export function ExploreContent() {
  const router = useRouter()

  const { data: trendingPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['explore', 'trending'],
    queryFn: () => fetch('/api/posts?feed=trending&limit=6').then((res) => res.json()),
  })

  const { data: trendingTags, isLoading: tagsLoading } = useQuery({
    queryKey: ['explore', 'tags'],
    queryFn: () => fetch('/api/tags?limit=20').then((res) => res.json()),
  })

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover resources from students worldwide
        </p>
      </div>

      <SearchBar onSubmit={handleSearch} placeholder="Search resources, subjects, colleges..." />

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5" />
          Trending Posts
        </h2>
        {postsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(trendingPosts?.data ?? []).slice(0, 6).map((post: any) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <p className="line-clamp-1 text-sm font-medium">{post.title}</p>
                    {post.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {post.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{post.user?.username}</span>
                      <span>&middot;</span>
                      <span>{post.likesCount ?? 0} likes</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Hash className="h-5 w-5" />
          Trending Tags
        </h2>
        {tagsLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(trendingTags ?? []).map((tag: any) => (
              <Link key={tag.id} href={`/search?q=${tag.name}&tab=resources`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 hover:text-primary">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <Link key={cat.label} href={`/search?q=${cat.label}&tab=resources`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
