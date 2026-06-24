'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CommentItem } from '@/components/comments/comment-item'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { CommentWithUser } from '@/lib/types'

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const { data: comments, isLoading } = useQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () =>
      fetch(`/api/posts/${postId}/comments`).then((res) => res.json()),
    enabled: !!postId,
  })

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }).then((res) => res.json()),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] })
    },
    onError: () => {
      toast.error('Failed to add comment')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    addCommentMutation.mutate(content.trim())
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      {session?.user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || ''} />
            <AvatarFallback>{session.user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !comments || comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: CommentWithUser) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}
