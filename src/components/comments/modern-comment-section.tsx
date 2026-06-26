'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { CommentItem } from '@/components/comments/comment-item'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Send, Smile, ImagePlus, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { CommentWithUser } from '@/lib/types'

interface CommentWithReplies extends CommentWithUser {
  replies: CommentWithUser[]
}

interface ModernCommentSectionProps {
  postId: string
}

export function ModernCommentSection({ postId }: ModernCommentSectionProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const { data: comments, isLoading } = useQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetch(`/api/posts/${postId}/comments`).then((res) => res.json()),
    enabled: !!postId,
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      }).then((res) => res.json()),
    onSuccess: () => {
      setContent('')
      setIsFocused(false)
      queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] })
    },
    onError: () => { toast.error('Failed to add comment') },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    addCommentMutation.mutate({ content: content.trim() })
  }

  const handleReply = (parentId: string, content: string) => {
    addCommentMutation.mutate({ content, parentId })
  }

  const topLevelCount = comments?.length || 0
  const totalCount = comments?.reduce((acc: number, c: CommentWithReplies) => acc + 1 + (c.replies?.length || 0), 0) || 0

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground/60" />
            <h3 className="text-base font-bold">Discussion</h3>
          </div>
          {totalCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-primary/10 px-1.5 text-[11px] font-bold text-primary/70">
              {totalCount}
            </span>
          )}
        </div>
        {topLevelCount > 1 && (
          <button className="text-xs font-medium text-muted-foreground/50 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50">
            Newest first
          </button>
        )}
      </div>

      {/* Comment form */}
      {session?.user && (
        <form onSubmit={handleSubmit}>
          <div className={cn(
            'rounded-2xl border transition-all duration-300 overflow-hidden',
            isFocused
              ? 'border-primary/30 bg-card shadow-lg shadow-primary/5'
              : 'border-border/40 bg-card/50 hover:border-border/60'
          )}>
            <div className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                    {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => !content && setIsFocused(false)}
                    rows={isFocused ? 3 : 1}
                    className={cn(
                      'resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 transition-all duration-200 px-3 py-2.5',
                      isFocused ? 'min-h-[80px]' : 'min-h-[40px]'
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Actions bar */}
            <div className={cn(
              'flex items-center justify-between px-4 py-3 border-t border-border/30 bg-muted/20 transition-all duration-300',
              isFocused ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden py-0 border-t-0'
            )}>
              <div className="flex items-center gap-1">
                <button type="button" className="p-2 rounded-lg text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/50 transition-colors">
                  <Smile className="h-4 w-4" />
                </button>
                <button type="button" className="p-2 rounded-lg text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/50 transition-colors">
                  <ImagePlus className="h-4 w-4" />
                </button>
                <button type="button" className="p-2 rounded-lg text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/50 transition-colors">
                  <AtSign className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setContent(''); setIsFocused(false) }}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || addCommentMutation.isPending}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                    content.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {addCommentMutation.isPending ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Posting
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-20 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <div className="flex gap-3 pt-1">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              </div>
              {/* Reply skeleton */}
              <div className="flex gap-3 mt-3 ml-8 pl-3 border-l-2 border-border/30">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-4 w-5/6 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !comments || comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 animate-float-up">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center border-2 border-background">
              <span className="text-[10px] font-bold text-primary/60">0</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-muted-foreground/70 mb-1">No comments yet</p>
          <p className="text-xs text-muted-foreground/40 text-center max-w-[240px]">
            Be the first to start the discussion
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {comments.map((comment: CommentWithReplies, i: number) => (
            <div key={comment.id} className="animate-float-up" style={{ animationDelay: `${Math.min(i * 40, 200)}ms` }}>
              <CommentItem
                comment={comment}
                replies={comment.replies || []}
                onReply={handleReply}
                isReplying={addCommentMutation.isPending}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
