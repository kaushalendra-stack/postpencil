'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, Eye, Heart, MessageCircle, Download, Search,
} from 'lucide-react'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function AdminContentPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', page, sortBy],
    queryFn: () => fetch(`/api/posts?page=${page}&limit=12&feed=${sortBy}`).then((res) => res.json()),
  })

  const posts = data?.data ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Content</h1>
          <p className="text-sm text-muted-foreground">Manage all posts and resources</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full h-10 rounded-xl border border-border bg-muted/30 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex gap-2">
            {['latest', 'trending'].map((s) => (
              <button
                key={s}
                onClick={() => { setSortBy(s); setPage(1) }}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  sortBy === s ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post: { id: string; title: string; description: string | null; subject: string | null; course: string | null; createdAt: string; likesCount: number; commentsCount: number; downloadsCount: number; viewsCount: number; user?: { name: string | null; username: string; image: string | null } }) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.user?.image ?? undefined} />
                    <AvatarFallback className="text-xs">{post.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">@{post.user?.username}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                {post.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.subject && <Badge variant="secondary" className="text-[10px]">{post.subject}</Badge>}
                  {post.course && <Badge variant="secondary" className="text-[10px]">{post.course}</Badge>}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(post.likesCount)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{formatNumber(post.commentsCount)}</span>
                  <span className="flex items-center gap-1"><Download className="h-3 w-3" />{formatNumber(post.downloadsCount)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(post.viewsCount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Page {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={posts.length < 12}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
