'use client'

import Link from 'next/link'
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Download,
  Bell,
  CheckCheck,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/hooks/use-notifications'
import type { NotificationItem } from '@/lib/types'

const ICON_MAP: Record<string, { icon: typeof Heart; color: string; bg: string }> = {
  like: { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  follow: { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  mention: { icon: AtSign, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  download: { icon: Download, color: 'text-orange-500', bg: 'bg-orange-500/10' },
}

const DEFAULT_MSG: Record<string, string> = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
  mention: 'mentioned you',
  download: 'downloaded your resource',
}

function NotificationItem({ notification }: { notification: NotificationItem }) {
  const config = ICON_MAP[notification.type] || { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted' }
  const Icon = config.icon
  const actor = notification.actor

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30',
        !notification.isRead && 'bg-muted/20'
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={actor?.image ?? undefined} />
          <AvatarFallback className="text-xs">
            {actor?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>
        <div className={cn("absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-background", config.bg)}>
          <Icon className={cn("h-3 w-3", config.color)} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">
          {actor && (
            <Link
              href={`/user/${actor.username}`}
              className="font-medium hover:underline"
            >
              {actor.name || actor.username}
            </Link>
          )}{' '}
          {notification.message ?? DEFAULT_MSG[notification.type] ?? 'sent you a notification'}
          {notification.post && (
            <Link
              href={`/post/${notification.post.id}`}
              className="font-medium hover:underline"
            >
              {' '}{notification.post.title}
            </Link>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  )
}

export function NotificationList() {
  const { data, isLoading } = useNotifications()

  const notifications: NotificationItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : []

  const unreadCount: number = data?.unreadCount ?? 0

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' })
      window.location.reload()
    } catch {}
  }

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="px-4 mb-4">
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3.5">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        {unreadCount > 0 && (
          <div className="px-4 py-3 border-b border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-foreground rounded-lg h-8"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark all as read ({unreadCount})
            </Button>
          </div>
        )}

        {/* List */}
        {notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              When someone interacts with your posts, you&apos;ll see it here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
