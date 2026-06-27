'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Activity, Heart, MessageCircle, UserPlus, Download, Clock, Bell,
  Shield, AlertTriangle, CheckCircle, Ban,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const ACTIVITY_TYPES: Record<string, { icon: typeof Heart; color: string; bg: string }> = {
  like: { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  follow: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
  download: { icon: Download, color: 'text-orange-500', bg: 'bg-orange-500/10' },
}

const AUDIT_ACTION_ICONS: Record<string, { icon: typeof Shield; color: string; bg: string }> = {
  ban_user: { icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10' },
  unban_user: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  report_resolved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  report_dismissed: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
}

interface AuditLog {
  id: string
  action: string
  targetType: string
  targetId: string | null
  details: string | null
  createdAt: string
  adminName: string | null
  adminUsername: string | null
}

export default function AdminActivityPage() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: () => fetch('/api/notifications').then((res) => res.json()),
  })

  const { data: auditData } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => fetch('/api/admin/audit-logs').then((res) => res.json()),
  })

  const items = Array.isArray(notifications) ? notifications : notifications?.data ?? []
  const auditLogs: AuditLog[] = auditData?.logs ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-10">
        {auditLogs.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-bold tracking-tight">Admin Actions</h2>
            </div>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-3">
                {auditLogs.map((log) => {
                  const config = AUDIT_ACTION_ICONS[log.action] || { icon: Shield, color: 'text-muted-foreground', bg: 'bg-muted/50' }
                  const Icon = config.icon
                  return (
                    <div key={log.id} className="relative flex items-start gap-4 pl-2">
                      <div className={cn('relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background shrink-0', config.bg)}>
                        <Icon className={cn('h-3.5 w-3.5', config.color)} />
                      </div>
                      <div className="flex-1 rounded-xl border border-border bg-card p-3">
                        <p className="text-sm">
                          <span className="font-medium">{log.adminName || 'Admin'}</span>
                          {' '}{log.details || log.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
            <p className="text-sm text-muted-foreground">Recent platform activity feed</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {items.map((notification: { id: string; type: string; message: string; createdAt: string; actor?: { name: string | null; username: string; image: string | null }; post?: { id: string; title: string } }) => {
                  const config = ACTIVITY_TYPES[notification.type] || { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted/50' }
                  const Icon = config.icon
                  return (
                    <div key={notification.id} className="relative flex items-start gap-4 pl-2">
                      <div className={cn('relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background shrink-0', config.bg)}>
                        <Icon className={cn('h-3.5 w-3.5', config.color)} />
                      </div>
                      <div className="flex-1 rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.actor?.image ?? undefined} />
                            <AvatarFallback className="text-xs">{notification.actor?.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm">
                              <Link href={`/user/${notification.actor?.username}`} className="font-medium hover:underline">{notification.actor?.name || 'Someone'}</Link>
                              {' '}{notification.message}
                              {notification.post && (
                                <Link href={`/post/${notification.post.id}`} className="font-medium hover:underline ml-1">{notification.post.title}</Link>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
