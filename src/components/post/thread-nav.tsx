'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThreadNavProps {
  threadTitle: string
  threadOrder: number
  threadCount: number
  postId: string
  threadPosts: { id: string; title: string; threadOrder: number }[]
}

export function ThreadNav({ threadTitle, threadOrder, threadCount, postId, threadPosts }: ThreadNavProps) {
  const router = useRouter()

  const currentIndex = threadPosts.findIndex((p) => p.id === postId)
  const prevPost = currentIndex > 0 ? threadPosts[currentIndex - 1] : null
  const nextPost = currentIndex < threadPosts.length - 1 ? threadPosts[currentIndex + 1] : null

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 mb-4 animate-float-up">
      {/* Thread header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5">
          <Layers className="h-4 w-4 text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{threadTitle}</p>
          <p className="text-[11px] text-muted-foreground/50">
            Part {threadOrder + 1} of {threadCount}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1 mb-3">
        {threadPosts.map((post) => (
          <button
            key={post.id}
            onClick={() => router.push(`/post/${post.id}`)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              post.id === postId
                ? 'bg-primary flex-[3]'
                : 'bg-muted-foreground/20 hover:bg-muted-foreground/40 flex-1'
            )}
            title={post.title}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevPost ? (
          <button
            onClick={() => router.push(`/post/${prevPost.id}`)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="truncate max-w-[120px]">Part {prevPost.threadOrder + 1}</span>
          </button>
        ) : <div />}

        {nextPost ? (
          <button
            onClick={() => router.push(`/post/${nextPost.id}`)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
          >
            <span className="truncate max-w-[120px]">Part {nextPost.threadOrder + 1}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  )
}
