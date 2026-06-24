'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminDashboard() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      <StatsGrid />
      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="reports">
          <ReportsList />
        </TabsContent>
        <TabsContent value="users">
          <UsersList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsGrid() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => fetch('/api/admin/stats').then((res) => res.json()),
  })

  const statItems = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Posts', value: stats?.totalPosts ?? 0, icon: FileText, color: 'text-green-500' },
    { label: 'Open Reports', value: stats?.openReports ?? 0, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Downloads', value: stats?.totalDownloads ?? 0, icon: BarChart3, color: 'text-purple-500' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <item.icon className={cn('h-4 w-4', item.color)} />
                </div>
                <p className="mt-2 text-2xl font-bold">{formatNumber(item.value)}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ReportsList() {
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => fetch('/api/admin/reports').then((res) => res.json()),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/reports/${id}/resolve`, { method: 'POST' }).then((res) =>
        res.json()
      ),
    onSuccess: () => {
      toast.success('Report resolved')
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/reports/${id}/dismiss`, { method: 'POST' }).then((res) =>
        res.json()
      ),
    onSuccess: () => {
      toast.success('Report dismissed')
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const items = reports ?? []

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-sm font-medium">No open reports</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-4">
      {items.map((report: any) => (
        <Card key={report.id}>
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{report.reason}</p>
                <Badge variant="outline" className="text-xs">
                  {report.status}
                </Badge>
              </div>
              {report.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {report.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Reported by {report.reporter?.username}</span>
                <span>&middot;</span>
                <span>{formatDate(report.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolveMutation.mutate(report.id)}
                disabled={resolveMutation.isPending}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Resolve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissMutation.mutate(report.id)}
                disabled={dismissMutation.isPending}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function UsersList() {
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => fetch('/api/admin/users').then((res) => res.json()),
  })

  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      fetch(`/api/admin/users/${id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned }),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('User updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const items = users ?? []

  return (
    <div className="space-y-3 pt-4">
      {items.map((user: any) => (
        <Card key={user.id}>
          <CardContent className="flex items-center gap-3 p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{user.name || user.username}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
            <Button
              size="sm"
              variant={user.isBanned ? 'default' : 'destructive'}
              onClick={() =>
                banMutation.mutate({ id: user.id, banned: !user.isBanned })
              }
              disabled={banMutation.isPending}
            >
              {user.isBanned ? (
                <>
                  <ShieldOff className="mr-1 h-3.5 w-3.5" />
                  Unban
                </>
              ) : (
                <>
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  Ban
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
