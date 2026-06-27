'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, Send } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useLikeDiscussion, useAddDiscussionReply, useDiscussion } from '@/hooks/use-discussions'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import type { DiscussionReplyWithUser } from '@/lib/types'

function ReplyItem({ reply, isNested = false }: { reply: DiscussionReplyWithUser & { replies?: DiscussionReplyWithUser[] }; isNested?: boolean }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(reply.likesCount)

  return (
    <div className={cn('group', isNested ? 'py-3' : 'p-4 hover:bg-muted/20 transition-colors')}>
      <div className={cn('flex gap-3', isNested && 'ml-8 pl-3 border-l-2 border-border/20')}>
        <Link href={`/user/${reply.user.username}`} className="shrink-0">
          <Avatar className={cn('ring-1 ring-border/30', isNested ? 'h-7 w-7' : 'h-8 w-8')}>
            <AvatarImage src={reply.user.image || undefined} />
            <AvatarFallback className={cn('font-semibold bg-muted/50', isNested ? 'text-[9px]' : 'text-[10px]')}>
              {reply.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/user/${reply.user.username}`} className={cn('font-semibold text-foreground/90 hover:text-foreground', isNested ? 'text-xs' : 'text-sm')}>
              {reply.user.name}
            </Link>
            <span className={cn('text-muted-foreground/40', isNested ? 'text-[10px]' : 'text-xs')}>@{reply.user.username}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span className={cn('text-muted-foreground/40', isNested ? 'text-[10px]' : 'text-xs')}>{formatDate(reply.createdAt)}</span>
          </div>
          <p className={cn('text-foreground/80 leading-relaxed whitespace-pre-wrap', isNested ? 'text-[13px]' : 'text-sm')}>
            {reply.content}
          </p>
          <div className="flex items-center gap-0.5 mt-1.5 -ml-1.5">
            <button
              onClick={() => { setIsLiked(!isLiked); setLikesCount(isLiked ? likesCount - 1 : likesCount + 1) }}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all duration-200',
                isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/5'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
              <span className="tabular-nums">{formatNumber(likesCount)}</span>
            </button>
          </div>
          {!isNested && reply.replies && reply.replies.length > 0 && (
            <div className="mt-2 space-y-0">
              {reply.replies.map((r) => (
                <ReplyItem key={r.id} reply={r} isNested />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DiscussionDetail({ discussionId }: { discussionId: string }) {
  const { data: session } = useSession()
  const { data: discussion, isLoading } = useDiscussion(discussionId)
  const likeMutation = useLikeDiscussion()
  const replyMutation = useAddDiscussionReply(discussionId)
  const [replyContent, setReplyContent] = useState('')
  const [showReplyInput, setShowReplyInput] = useState(false)

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return
    replyMutation.mutate({ content: replyContent.trim() }, {
      onSuccess: () => { setReplyContent(''); setShowReplyInput(false) },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4 animate-pulse">
        <div className="flex gap-3">
          <div className="h-11 w-11 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-32 rounded-full bg-muted" />
            <div className="h-5 w-3/4 rounded-full bg-muted" />
            <div className="h-4 w-full rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <p className="text-lg font-semibold text-muted-foreground">Discussion not found</p>
      </div>
    )
  }

  const replies = discussion.replies || []
  const topLevelReplies = replies.filter((r: DiscussionReplyWithUser) => !r.parentId)
  const nestedReplies = replies.filter((r: DiscussionReplyWithUser) => r.parentId)

  const threadedReplies = topLevelReplies.map((reply: DiscussionReplyWithUser) => ({
    ...reply,
    replies: nestedReplies.filter((r: DiscussionReplyWithUser) => r.parentId === reply.id),
  }))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4">
        {/* Main discussion */}
        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 mb-4 animate-float-up">
          <div className="flex gap-3">
            <Link href={`/user/${discussion.user.username}`} className="shrink-0">
              <Avatar className="h-11 w-11 ring-2 ring-background">
                <AvatarImage src={discussion.user.image || ''} />
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                  {discussion.user.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/user/${discussion.user.username}`} className="text-sm font-semibold hover:underline">
                  {discussion.user.name}
                </Link>
                <span className="text-xs text-muted-foreground/50">@{discussion.user.username}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                <span className="text-xs text-muted-foreground/50">{formatDate(discussion.createdAt)}</span>
              </div>
              <p className="text-foreground/85 whitespace-pre-wrap leading-relaxed mt-2">
                {discussion.content}
              </p>
              {discussion.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border/30 relative aspect-video">
                  <Image src={discussion.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
                </div>
              )}
              <div className="flex items-center gap-0.5 mt-3 -ml-1.5">
                <button
                  onClick={() => likeMutation.mutate(discussion.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    discussion.isLiked
                      ? 'text-rose-500 bg-rose-500/10'
                      : 'text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/5'
                  )}
                >
                  <Heart className={cn('h-4 w-4', discussion.isLiked && 'fill-current')} />
                  <span className="tabular-nums">{formatNumber(discussion.likesCount)}</span>
                </button>
                <button
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground/50 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="tabular-nums">{formatNumber(discussion.repliesCount)}</span>
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-200">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reply input */}
        {showReplyInput && session?.user && (
          <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 mb-4 animate-float-up">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="text-[10px] font-semibold bg-muted/50">
                  {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 px-3 py-2.5"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => { setReplyContent(''); setShowReplyInput(false) }}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || replyMutation.isPending}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                      replyContent.trim()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    {replyMutation.isPending ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {threadedReplies.length > 0 && (
          <div className="divide-y divide-border/20">
            {threadedReplies.map((reply: DiscussionReplyWithUser & { replies?: DiscussionReplyWithUser[] }) => (
              <ReplyItem key={reply.id} reply={reply} />
            ))}
          </div>
        )}

        {threadedReplies.length === 0 && !showReplyInput && (
          <div className="flex flex-col items-center justify-center py-12 animate-float-up">
            <p className="text-sm text-muted-foreground/50">No replies yet</p>
            <button
              onClick={() => setShowReplyInput(true)}
              className="mt-2 text-xs font-medium text-primary/70 hover:text-primary transition-colors"
            >
              Be the first to reply
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
