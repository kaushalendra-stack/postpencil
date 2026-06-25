'use client'

import { useFeed } from '@/hooks/use-posts'
import { PostCard } from '@/components/post/post-card'
import { PostCardSkeleton } from '@/components/feed/post-card-skeleton'
import { Button } from '@/components/ui/button'
import { useInView } from 'react-intersection-observer'
import { Loader2, Inbox } from 'lucide-react'

export function FeedList({ feedType = 'latest' }: { feedType?: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(feedType)
  const { ref } = useInView()

  if (isLoading) {
    return <div className="space-y-0 divide-y divide-border/50">{Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)}</div>
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? []

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Inbox className="h-8 w-8 text-muted-foreground" /></div>
        <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
        <p className="text-sm text-muted-foreground text-center">{feedType === 'following' ? 'Follow some users to see their posts here.' : 'Be the first to share a resource!'}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {posts.map((post, index) => (
        <div key={post.id} className="animate-in fade-in-0 fill-mode-both" style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}>
          <PostCard post={post} />
        </div>
      ))}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-6">
          <Button variant="ghost" size="sm" disabled={isFetchingNextPage} onClick={() => fetchNextPage()} className="rounded-full">
            {isFetchingNextPage ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading...</> : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}
