'use client'

import { useFeed } from '@/hooks/use-posts'
import { PostCard } from '@/components/post/post-card'
import { PostCardSkeleton } from '@/components/feed/post-card-skeleton'
import { Button } from '@/components/ui/button'
import { useInView } from 'react-intersection-observer'
import { Loader2, Inbox } from 'lucide-react'

interface FeedListProps {
  feedType?: string
}

export function FeedList({ feedType = 'latest' }: FeedListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(feedType)
  const { ref } = useInView()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? []

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No posts yet</h3>
        <p className="text-sm text-muted-foreground">
          {feedType === 'following' 
            ? 'Follow some users to see their posts here.'
            : 'Be the first to share a resource!'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading more...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
