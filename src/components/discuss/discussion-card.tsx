'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useLikeDiscussion } from '@/hooks/use-discussions'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { DiscussionWithUser } from '@/lib/types'

async function handleShare(id: string) {
  const url = window.location.origin + '/discuss/' + id
  if (navigator.share) {
    try { await navigator.share({ url }) } catch {}
  } else {
    try { await navigator.clipboard.writeText(url); toast.success('Link copied', { duration: 1200 }) } catch {}
  }
}

export function DiscussionCard({ discussion, index = 0 }: { discussion: DiscussionWithUser; index?: number }) {
  const router = useRouter()
  const likeMutation = useLikeDiscussion()

  return (
    <article
      className={cn(
        'group p-4 hover:bg-muted/20 transition-colors duration-200 cursor-pointer border-b border-border/20',
        'animate-float-up',
        index < 10 && `stagger-${Math.min(index + 1, 10)}`
      )}
      onClick={() => router.push(`/discuss/${discussion.id}`)}
    >
      <div className="flex gap-3">
        <Link href={`/user/${discussion.user.username}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Avatar className="h-9 w-9 ring-1 ring-border/30 transition-all duration-200 group-hover:ring-primary/20">
            <AvatarImage src={discussion.user.image || ''} />
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-muted/50 to-muted/30">
              {discussion.user.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/user/${discussion.user.username}`} onClick={(e) => e.stopPropagation()} className="text-sm font-semibold text-foreground/90 hover:text-foreground transition-colors truncate">
              {discussion.user.name}
            </Link>
            <span className="text-xs text-muted-foreground/40">@{discussion.user.username}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground/40 shrink-0">{formatDate(discussion.createdAt)}</span>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words mb-3">
            {discussion.content}
          </p>

          {discussion.imageUrl && (
            <div className="mb-3 rounded-xl overflow-hidden border border-border/30 relative aspect-video">
              <Image src={discussion.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          )}

          <div className="flex items-center gap-0.5 -ml-1.5">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); likeMutation.mutate(discussion.id) }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                discussion.isLiked
                  ? 'text-rose-500 bg-rose-500/10'
                  : 'text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/5'
              )}
            >
              <Heart className={cn('h-4 w-4 transition-transform duration-200', discussion.isLiked && 'fill-current scale-110')} />
              <span className="tabular-nums">{formatNumber(discussion.likesCount)}</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground/50 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="tabular-nums">{formatNumber(discussion.repliesCount)}</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(discussion.id) }}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              className="inline-flex items-center rounded-full p-1.5 text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-muted/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
