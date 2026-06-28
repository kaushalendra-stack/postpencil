'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useLikeDiscussion } from '@/hooks/use-discussions'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useState, useRef, useCallback } from 'react'
import type { DiscussionWithUser } from '@/lib/types'

export function DiscussionCard({
  discussion,
}: {
  discussion: DiscussionWithUser
  index?: number
}) {
  const router = useRouter()
  const likeMutation = useLikeDiscussion()
  const [liked, setLiked] = useState(!!discussion.isLiked)
  const [likesCount, setLikesCount] = useState(discussion.likesCount)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const nextHeartId = useRef(0)

  const spawnHeart = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const id = nextHeartId.current++
    setHearts((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 800)
  }, [])

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    spawnHeart(e)
    const next = !liked
    setLiked(next)
    setLikesCount((c) => next ? c + 1 : c - 1)
    likeMutation.mutate(discussion.id)
  }, [liked, likeMutation, discussion.id, spawnHeart])

  return (
    <div
      ref={cardRef}
      className="group relative border-b border-border/20 hover:bg-muted/15 transition-colors duration-200"
      onClick={() => router.push(`/discuss/${discussion.id}`)}
    >
      {hearts.map((h) => (
        <Heart
          key={h.id}
          className="absolute pointer-events-none text-rose-500 fill-current heart-float z-50"
          style={{ left: h.x - 7, top: h.y - 7, width: 14, height: 14 }}
        />
      ))}

      <div className="flex gap-3.5 p-4 cursor-pointer">
        <Link
          href={`/user/${discussion.user.username}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 mt-0.5"
        >
          <Avatar className="h-10 w-10 transition-transform duration-200 group-hover:scale-105">
            <AvatarImage src={discussion.user.image || ''} />
            <AvatarFallback className="text-xs font-semibold bg-muted">
              {discussion.user.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[14px]">
            <Link
              href={`/user/${discussion.user.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-foreground hover:underline truncate"
            >
              {discussion.user.name}
            </Link>
            <span className="text-muted-foreground/40 truncate text-[13px]">
              @{discussion.user.username}
            </span>
            <span className="text-muted-foreground/15">&middot;</span>
            <time className="text-muted-foreground/35 text-[13px] shrink-0 tabular-nums">
              {formatDate(discussion.createdAt)}
            </time>
          </div>

          <p className="text-[15px] text-foreground/80 leading-[1.5] whitespace-pre-wrap break-words mt-0.5">
            {discussion.content}
          </p>

          {discussion.imageUrl && (
            <div className="mt-2.5 rounded-2xl overflow-hidden border border-border/20">
              <Image
                src={discussion.imageUrl}
                alt=""
                width={600}
                height={340}
                className="w-full object-cover max-h-80 transition-transform duration-700 group-hover:scale-[1.01]"
              />
            </div>
          )}

          <div className="flex items-center gap-0.5 mt-2 -ml-1.5">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/discuss/${discussion.id}`)
              }}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] text-muted-foreground/35 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              {discussion.repliesCount > 0 && (
                <span className="tabular-nums">{formatNumber(discussion.repliesCount)}</span>
              )}
            </button>

            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] transition-all duration-200',
                liked
                  ? 'text-rose-500 bg-rose-500/10'
                  : 'text-muted-foreground/35 hover:text-rose-500 hover:bg-rose-500/5'
              )}
            >
              <Heart className={cn('w-[18px] h-[18px] transition-all duration-300', liked && 'fill-current')} />
              {likesCount > 0 && (
                <span className="tabular-nums">{formatNumber(likesCount)}</span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigator.clipboard.writeText(window.location.origin + '/discuss/' + discussion.id)
                toast.success('Copied', { duration: 800 })
              }}
              className="rounded-full p-1.5 text-muted-foreground/25 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
            >
              <Share2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
