'use client'

import Link from 'next/link'
import { Heart, MessageCircle, MoreHorizontal, Share2, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type { CommentWithUser } from '@/lib/types'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface CommentItemProps {
  comment: CommentWithUser
  replies?: CommentWithUser[]
  onReply?: (parentId: string, content: string) => void
  isReplying?: boolean
  isNested?: boolean
}

export function CommentItem({ comment, replies = [], onReply, isReplying, isNested = false }: CommentItemProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likesCount)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [showReplies, setShowReplies] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleReplySubmit = () => {
    if (!replyContent.trim() || !onReply) return
    onReply(comment.id, replyContent.trim())
    setReplyContent('')
    setShowReplyInput(false)
    setShowReplies(true)
  }

  return (
    <div className={cn(
      'group',
      isNested ? 'py-3' : 'p-4 hover:bg-muted/20 transition-colors duration-200'
    )}>
      <div className={cn('flex gap-3', isNested && 'ml-8 pl-3 border-l-2 border-border/20')}>
        {/* Avatar */}
        <Link href={`/user/${comment.user.username}`} className="shrink-0">
          <Avatar className={cn(
            'ring-1 ring-border/30 transition-all duration-200 group-hover:ring-primary/20',
            isNested ? 'h-7 w-7' : 'h-9 w-9'
          )}>
            <AvatarImage src={comment.user.image || undefined} alt={comment.user.name || ''} />
            <AvatarFallback className={cn(
              'font-semibold bg-gradient-to-br from-muted/50 to-muted/30',
              isNested ? 'text-[9px]' : 'text-xs'
            )}>
              {comment.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/user/${comment.user.username}`}
              className={cn('font-semibold text-foreground/90 hover:text-foreground transition-colors', isNested ? 'text-xs' : 'text-sm')}
            >
              {comment.user.name || 'Anonymous'}
            </Link>
            <span className={cn('text-muted-foreground/40', isNested ? 'text-[10px]' : 'text-xs')}>
              @{comment.user.username}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span className={cn('text-muted-foreground/40', isNested ? 'text-[10px]' : 'text-xs')}>
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Comment text */}
          <p className={cn(
            'text-foreground/80 leading-relaxed whitespace-pre-wrap break-words',
            isNested ? 'text-[13px]' : 'text-sm'
          )}>
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-0.5 mt-2 -ml-1.5">
            <button
              onClick={handleLike}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                isLiked
                  ? 'text-rose-500 bg-rose-500/10'
                  : 'text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/5'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5 transition-transform duration-200', isLiked && 'fill-current scale-110')} />
              <span className="tabular-nums">{formatNumber(likesCount)}</span>
            </button>

            {!isNested && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground/50 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Reply</span>
              </button>
            )}

            <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-200">
              <Share2 className="h-3.5 w-3.5" />
            </button>

            <button className="inline-flex items-center rounded-full p-1.5 text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-muted/50 transition-all duration-200 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Reply input */}
          {showReplyInput && session?.user && (
            <div className="mt-3 flex gap-2 animate-float-up">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="text-[10px] font-semibold bg-muted/50">
                  {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 rounded-xl bg-muted/30 border border-border/30 px-3 py-2 focus-within:border-primary/30 focus-within:bg-card transition-all duration-200">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReplySubmit()}
                    placeholder={`Reply to ${comment.user.name || 'this comment'}...`}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                    autoFocus
                  />
                  <button
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim() || isReplying}
                    className={cn(
                      'transition-colors p-1 rounded-lg',
                      replyContent.trim()
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-muted-foreground/30 cursor-not-allowed'
                    )}
                  >
                    {isReplying ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent block" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show/Hide replies toggle */}
          {!isNested && replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 mt-2 text-xs font-medium text-primary/70 hover:text-primary transition-colors"
            >
              {showReplies ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              <span>
                {showReplies ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}

          {/* Nested replies */}
          {!isNested && showReplies && replies.length > 0 && (
            <div className="mt-2 space-y-0">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isNested={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
