'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ArrowLeft } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  useLikeDiscussion,
  useAddDiscussionReply,
  useDiscussion,
} from '@/hooks/use-discussions'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useState, useCallback } from 'react'
import type { DiscussionReplyWithUser } from '@/lib/types'

function ReplyComposer({
  discussionId,
  replyingTo,
  onCancel,
}: {
  discussionId: string
  replyingTo?: string
  onCancel?: () => void
}) {
  const { data: session } = useSession()
  const replyMutation = useAddDiscussionReply(discussionId)
  const [content, setContent] = useState('')

  if (!session?.user) return null

  return (
    <div className="flex gap-3.5 p-4">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={session.user.image || undefined} />
        <AvatarFallback className="text-[10px] font-semibold bg-muted">
          {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Post your reply"
          rows={2}
          className="w-full resize-none border-0 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 leading-relaxed"
        />
        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border/15">
          {onCancel && (
            <button onClick={onCancel} className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors px-2.5">
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (!content.trim()) return
              replyMutation.mutate(
                { content: content.trim(), parentId: replyingTo },
                { onSuccess: () => { setContent(''); onCancel?.() } }
              )
            }}
            disabled={!content.trim() || replyMutation.isPending}
            className={cn(
              'px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
              content.trim()
                ? 'bg-foreground text-background hover:opacity-90 active:scale-[0.97]'
                : 'bg-muted text-muted-foreground/25 cursor-not-allowed'
            )}
          >
            {replyMutation.isPending ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ThreadReply({
  reply,
  discussionId,
  allReplies,
  isLast,
}: {
  reply: DiscussionReplyWithUser & { replies?: DiscussionReplyWithUser[] }
  discussionId: string
  allReplies: DiscussionReplyWithUser[]
  isLast: boolean
}) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(reply.likesCount)
  const parentReply = reply.parentId ? allReplies.find((r) => r.id === reply.parentId) : null

  return (
    <div className="border-b border-border/15">
      <div className="flex gap-3.5 px-4 py-3.5 hover:bg-muted/15 transition-colors duration-200">
        <div className="relative shrink-0">
          <Link href={`/user/${reply.user.username}`}>
            <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-105">
              <AvatarImage src={reply.user.image || undefined} />
              <AvatarFallback className="text-[10px] font-semibold bg-muted">
                {reply.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          {!isLast && (
            <div className="absolute top-[44px] left-1/2 -translate-x-1/2 w-px bg-border/20 bottom-0" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[14px]">
            <Link href={`/user/${reply.user.username}`} className="font-bold text-foreground hover:underline truncate">
              {reply.user.name}
            </Link>
            <span className="text-muted-foreground/35 truncate text-[13px]">@{reply.user.username}</span>
            <span className="text-muted-foreground/15">&middot;</span>
            <time className="text-muted-foreground/35 text-[13px] shrink-0 tabular-nums">{formatDate(reply.createdAt)}</time>
            <button className="ml-auto p-1.5 -mr-1.5 rounded-full text-muted-foreground/20 hover:text-muted-foreground/60 hover:bg-muted/40 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {reply.parentId && parentReply && (
            <p className="text-[13px] text-muted-foreground/35 mt-0.5">
              Replying to{' '}
              <Link href={`/user/${parentReply.user.username}`} className="text-blue-500/70 hover:text-blue-500 transition-colors">
                @{parentReply.user.username}
              </Link>
            </p>
          )}

          <p className="text-[14px] text-foreground/75 leading-[1.55] whitespace-pre-wrap break-words mt-0.5">
            {reply.content}
          </p>

          <div className="flex items-center gap-0.5 mt-2 -ml-1.5">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] text-muted-foreground/30 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => {
                setIsLiked(!isLiked)
                setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] transition-all duration-200',
                isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/5'
              )}
            >
              <Heart className={cn('w-[18px] h-[18px] transition-all duration-300', isLiked && 'fill-current')} />
              {likesCount > 0 && <span className="tabular-nums">{formatNumber(likesCount)}</span>}
            </button>
            <button className="rounded-full p-1.5 text-muted-foreground/20 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200">
              <Share2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {showReplyInput && (
        <div className="ml-12 border-l-2 border-border/10 animate-in fade-in duration-200">
          <ReplyComposer discussionId={discussionId} replyingTo={reply.id} onCancel={() => setShowReplyInput(false)} />
        </div>
      )}

      {reply.replies && reply.replies.length > 0 && (
        <div className="ml-10 border-l-2 border-border/10">
          {reply.replies.map((nestedReply) => (
            <div key={nestedReply.id} className="flex gap-3 px-4 py-3 hover:bg-muted/10 transition-colors duration-200">
              <Link href={`/user/${nestedReply.user.username}`} className="shrink-0 mt-0.5">
                <Avatar className="h-7 w-7 transition-transform duration-200 hover:scale-110">
                  <AvatarImage src={nestedReply.user.image || undefined} />
                  <AvatarFallback className="text-[8px] font-semibold bg-muted">
                    {nestedReply.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[13px]">
                  <Link href={`/user/${nestedReply.user.username}`} className="font-bold text-foreground hover:underline truncate">
                    {nestedReply.user.name}
                  </Link>
                  <span className="text-muted-foreground/30 truncate text-[12px]">@{nestedReply.user.username}</span>
                  <span className="text-muted-foreground/15">&middot;</span>
                  <time className="text-muted-foreground/30 text-[12px] shrink-0 tabular-nums">{formatDate(nestedReply.createdAt)}</time>
                </div>
                <p className="text-[13px] text-foreground/65 leading-[1.55] whitespace-pre-wrap break-words mt-0.5">
                  {nestedReply.content}
                </p>
                <div className="flex items-center gap-0.5 mt-1.5 -ml-1">
                  <button className="rounded-full p-1.5 text-muted-foreground/20 hover:text-blue-500 hover:bg-blue-500/5 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                  <button className="rounded-full p-1.5 text-muted-foreground/20 hover:text-rose-500 hover:bg-rose-500/5 transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                  <button className="rounded-full p-1.5 text-muted-foreground/20 hover:text-blue-500 hover:bg-blue-500/5 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DiscussionDetail({ discussionId }: { discussionId: string }) {
  const { data: session } = useSession()
  const { data: discussion, isLoading } = useDiscussion(discussionId)
  const likeMutation = useLikeDiscussion()
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  const resolvedLiked = discussion ? ('isLiked' in discussion ? !!discussion.isLiked : liked) : liked
  const resolvedLikesCount = discussion ? discussion.likesCount : likesCount

  const handleLike = useCallback(() => {
    const next = !resolvedLiked
    setLiked(next)
    setLikesCount(next ? resolvedLikesCount + 1 : resolvedLikesCount - 1)
    if (discussion) likeMutation.mutate(discussion.id)
  }, [resolvedLiked, resolvedLikesCount, discussion, likeMutation])

  if (isLoading) {
    return (
      <div className="max-w-[620px] mx-auto min-h-screen animate-pulse">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/25 px-5 py-3.5 flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-4 w-20 rounded-full bg-muted" />
        </div>
        <div className="p-5 space-y-6">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-36 rounded-full bg-muted" />
              <div className="h-3 w-24 rounded-full bg-muted/60" />
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="h-4 w-full rounded-full bg-muted/60" />
            <div className="h-4 w-3/4 rounded-full bg-muted/60" />
            <div className="h-4 w-1/2 rounded-full bg-muted/60" />
          </div>
          <div className="flex gap-8 pt-4 border-t border-border/15">
            <div className="h-10 w-10 rounded-full bg-muted/50" />
            <div className="h-10 w-10 rounded-full bg-muted/50" />
            <div className="h-10 w-10 rounded-full bg-muted/50" />
            <div className="h-10 w-10 rounded-full bg-muted/50" />
          </div>
        </div>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="max-w-[620px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/20 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-7 w-7 text-muted-foreground/20" />
          </div>
          <p className="text-sm text-muted-foreground/50 font-medium">Post not found</p>
        </div>
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
    <div className="max-w-[620px] mx-auto min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/25">
        <div className="flex items-center gap-5 px-4 h-[52px]">
          <Link href="/discuss" className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-all duration-200 hover:scale-110 active:scale-90">
            <ArrowLeft className="h-4 w-4 text-foreground/50" />
          </Link>
          <h1 className="text-[15px] font-bold text-foreground tracking-tight">Thread</h1>
        </div>
      </div>

      {/* Original post */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-3.5">
          <Link href={`/user/${discussion.user.username}`} className="shrink-0">
            <Avatar className="h-12 w-12 transition-transform duration-200 hover:scale-105">
              <AvatarImage src={discussion.user.image || ''} />
              <AvatarFallback className="text-sm font-semibold bg-muted">
                {discussion.user.name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/user/${discussion.user.username}`} className="font-bold text-[15px] text-foreground hover:underline block leading-5">
                  {discussion.user.name}
                </Link>
                <span className="text-[13px] text-muted-foreground/40">@{discussion.user.username}</span>
              </div>
              <button className="p-2 -mr-2 rounded-full text-muted-foreground/25 hover:text-muted-foreground/60 hover:bg-muted/40 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-[17px] text-foreground/80 leading-[1.55] whitespace-pre-wrap break-words mt-3">
          {discussion.content}
        </p>

        {discussion.imageUrl && (
          <div className="mt-3 rounded-2xl overflow-hidden border border-border/15">
            <Image src={discussion.imageUrl} alt="" width={600} height={340} className="w-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-3 text-[13px] text-muted-foreground/35">
          <time className="tabular-nums">{formatDate(discussion.createdAt)}</time>
        </div>

        {/* Stats */}
        {(discussion.repliesCount > 0 || resolvedLikesCount > 0 || discussion.viewsCount > 0) && (
          <div className="flex gap-5 mt-3 py-3 border-y border-border/15 text-[13px]">
            {discussion.repliesCount > 0 && (
              <span>
                <span className="font-bold text-foreground">{formatNumber(discussion.repliesCount)}</span>{' '}
                <span className="text-muted-foreground/40">Replies</span>
              </span>
            )}
            {resolvedLikesCount > 0 && (
              <span>
                <span className="font-bold text-foreground">{formatNumber(resolvedLikesCount)}</span>{' '}
                <span className="text-muted-foreground/40">Likes</span>
              </span>
            )}
            {discussion.viewsCount > 0 && (
              <span>
                <span className="font-bold text-foreground">{formatNumber(discussion.viewsCount)}</span>{' '}
                <span className="text-muted-foreground/40">Views</span>
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-around py-1 border-b border-border/15">
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="rounded-full p-2.5 text-muted-foreground/25 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2.5 text-muted-foreground/25 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200">
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleLike}
            className={cn(
              'rounded-full p-2.5 transition-all duration-200',
              resolvedLiked
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-muted-foreground/25 hover:text-rose-500 hover:bg-rose-500/5'
            )}
          >
            <Heart className={cn('h-5 w-5 transition-all duration-300', resolvedLiked && 'fill-current')} />
          </button>
          <button className="rounded-full p-2.5 text-muted-foreground/25 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Reply composer */}
      {showReplyInput && session?.user && (
        <div className="border-b border-border/15 animate-in fade-in duration-200">
          <ReplyComposer discussionId={discussionId} onCancel={() => setShowReplyInput(false)} />
        </div>
      )}

      {/* Replies with thread lines */}
      {threadedReplies.length > 0 ? (
        <div>
          {threadedReplies.map((reply: DiscussionReplyWithUser & { replies?: DiscussionReplyWithUser[] }, idx: number) => (
            <ThreadReply
              key={reply.id}
              reply={reply}
              discussionId={discussionId}
              allReplies={replies}
              isLast={idx === threadedReplies.length - 1}
            />
          ))}
        </div>
      ) : (
        !showReplyInput && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-lg" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border/25 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary/20" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground/40 font-medium">No replies yet</p>
            <button
              onClick={() => setShowReplyInput(true)}
              className="mt-1.5 text-xs text-blue-500/60 hover:text-blue-500 transition-colors font-medium"
            >
              Be the first to reply
            </button>
          </div>
        )
      )}
    </div>
  )
}
