'use client'

import Link from 'next/link'
import { Heart, Reply } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type { CommentWithUser } from '@/lib/types'
import { useState } from 'react'

interface CommentItemProps {
  comment: CommentWithUser
}

export function CommentItem({ comment }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likesCount)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  return (
    <div className="flex gap-3">
      <Link href={`/user/${comment.user.username}`} className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.image || undefined} alt={comment.user.name || ''} />
          <AvatarFallback>{comment.user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/user/${comment.user.username}`}
            className="text-sm font-semibold hover:underline"
          >
            {comment.user.name || 'Anonymous'}
          </Link>
          <span className="text-xs text-muted-foreground">
            @{comment.user.username}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <p className="text-sm">{comment.content}</p>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 gap-1 px-2',
              isLiked && 'text-red-500'
            )}
            onClick={handleLike}
          >
            <Heart className={cn('h-3 w-3', isLiked && 'fill-current')} />
            <span className="text-xs">{formatNumber(likesCount)}</span>
          </Button>

          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
            <Reply className="h-3 w-3" />
            <span className="text-xs">Reply</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
