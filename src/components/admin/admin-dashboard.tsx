'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Users, FileText, AlertTriangle, BarChart3, CheckCircle, Download, Eye, Heart,
  ArrowUpRight, Sparkles, Zap,
} from 'lucide-react'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your platform</p>
        </div>
        <OverviewTab />
      </div>
    </div>
  )
}

function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetch('/api/admin').then((res) => res.json()),
  })

  const { data: recentPosts } = useQuery({
    queryKey: ['admin', 'recent-posts'],
    queryFn: () => fetch('/api/posts?limit=5&feed=latest').then((res) => res.json()),
  })

  const { data: recentUsers } = useQuery({
    queryKey: ['admin', 'recent-users'],
    queryFn: () => fetch('/api/admin/users?limit=5').then((res) => res.json()),
  })

  const { data: reports } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => fetch('/api/admin/reports').then((res) => res.json()),
  })

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Total Posts', value: stats?.totalPosts ?? 0, icon: FileText, gradient: 'from-green-500 to-green-600' },
    { label: 'Downloads', value: stats?.totalDownloads ?? 0, icon: Download, gradient: 'from-purple-500 to-purple-600' },
    { label: 'Reports', value: stats?.pendingReports ?? 0, icon: AlertTriangle, gradient: 'from-orange-500 to-orange-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{formatNumber(stat.value)}</p>
                </div>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', stat.gradient)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Posts */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Recent Posts
            </h3>
            <Link href="/explore" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(recentPosts?.data ?? []).slice(0, 5).map((post: { id: string; title: string; user?: { username: string }; createdAt: string; likesCount: number; viewsCount: number }) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{post.title}</p>
                  <p className="text-xs text-muted-foreground">@{post.user?.username} · {formatDate(post.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(post.likesCount)}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(post.viewsCount)}</span>
                </div>
              </Link>
            ))}
            {(!recentPosts?.data || recentPosts.data.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">No posts yet</p>
            )}
          </div>
        </div>

        {/* Reports */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Reports
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {reports?.length ?? 0} pending
            </span>
          </div>
          <div className="space-y-3">
            {(reports ?? []).slice(0, 4).map((report: { id: string; reason: string; reporter?: { username: string } }) => (
              <div key={report.id} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium line-clamp-1">{report.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">by {report.reporter?.username}</p>
              </div>
            ))}
            {(!reports || reports.length === 0) && (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">All clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Users */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Recent Users
            </h3>
          </div>
          <div className="space-y-3">
            {(recentUsers ?? []).slice(0, 5).map((user: { id: string; name: string | null; username: string; image: string | null; role: string }) => (
              <Link
                key={user.id}
                href={`/user/${user.username}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-xs">{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{user.name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {user.role}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Manage Users</p>
                <p className="text-xs text-muted-foreground">Ban, unban, view profiles</p>
              </div>
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Review Reports</p>
                <p className="text-xs text-muted-foreground">Resolve or dismiss reports</p>
              </div>
            </Link>
            <Link href="/admin/content" className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <FileText className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">View Content</p>
                <p className="text-xs text-muted-foreground">Browse all posts</p>
              </div>
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">View platform stats</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
