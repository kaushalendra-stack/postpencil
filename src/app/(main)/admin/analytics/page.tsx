'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Users, FileText, Download, Eye, Heart, TrendingUp, BarChart3,
} from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetch('/api/admin').then((res) => res.json()),
  })

  const { data: posts } = useQuery({
    queryKey: ['admin', 'analytics-posts'],
    queryFn: () => fetch('/api/posts?limit=50&feed=latest').then((res) => res.json()),
  })

  const allPosts = posts?.data ?? []

  const totalLikes = allPosts.reduce((sum: number, p: { likesCount?: number }) => sum + (p.likesCount || 0), 0)
  const totalComments = allPosts.reduce((sum: number, p: { commentsCount?: number }) => sum + (p.commentsCount || 0), 0)
  const totalViews = allPosts.reduce((sum: number, p: { viewsCount?: number }) => sum + (p.viewsCount || 0), 0)

  const topPosts = [...allPosts].sort((a: { trendingScore?: number }, b: { trendingScore?: number }) => (b.trendingScore || 0) - (a.trendingScore || 0)).slice(0, 5)

  const resourceTypes = allPosts.reduce((acc: Record<string, number>, p: { resourceType?: string }) => {
    const type = p.resourceType || 'document'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Posts', value: stats?.totalPosts ?? 0, icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Downloads', value: stats?.totalDownloads ?? 0, icon: Download, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Total Likes', value: totalLikes, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Total Comments', value: totalComments, icon: BarChart3, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Platform performance metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              {isLoading ? (
                <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{formatNumber(stat.value)}</p>
                  </div>
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.bg)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Posts */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Top Posts
            </h3>
            <div className="space-y-3">
              {topPosts.map((post: { id: string; title: string; user?: { username: string }; likesCount: number; viewsCount: number }, i: number) => (
                <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">@{post.user?.username}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(post.likesCount)}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(post.viewsCount)}</span>
                  </div>
                </div>
              ))}
              {topPosts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              )}
            </div>
          </div>

          {/* Resource Types */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Resource Types
            </h3>
            <div className="space-y-3">
              {Object.entries(resourceTypes).map(([type, count]) => {
                const percentage = allPosts.length > 0 ? ((count as number) / allPosts.length) * 100 : 0
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <span className="text-xs text-muted-foreground">{count as number} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(resourceTypes).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
