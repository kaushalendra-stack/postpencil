'use client'

import { useState } from 'react'
import { useFeed } from '@/hooks/use-posts'
import { ModernPostCard } from './modern-post-card'
import { Button } from '@/components/ui/button'
import { useInView } from 'react-intersection-observer'
import { Loader2, Inbox, Sparkles, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { value: 'latest', label: 'For You', icon: Sparkles },
  { value: 'following', label: 'Following', icon: Users },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
]

export function ModernFeed() {
  const [feedType, setFeedType] = useState('latest')
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(feedType)
  const { ref } = useInView()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex px-2 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.value}
                onClick={() => setFeedType(tab.value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-300 relative rounded-xl my-1',
                  feedType === tab.value
                    ? 'text-foreground bg-accent/60'
                    : 'text-muted-foreground hover:text-foreground/70 hover:bg-accent/30'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {feedType === tab.value && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-primary animate-scale-in" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card/50 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-full bg-muted" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 rounded-full bg-muted" />
                      <div className="h-3 w-14 rounded-full bg-muted" />
                    </div>
                    <div className="h-5 w-3/4 rounded-full bg-muted" />
                    <div className="h-4 w-full rounded-full bg-muted" />
                    <div className="h-4 w-5/6 rounded-full bg-muted" />
                    <div className="flex gap-2 mt-2">
                      <div className="h-8 w-16 rounded-full bg-muted" />
                      <div className="h-8 w-16 rounded-full bg-muted" />
                      <div className="h-8 w-16 rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (() => {
          const posts = data?.pages.flatMap((page) => page.data) ?? []

          if (posts.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-24 animate-float-up">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center animate-glow">
                    <Inbox className="h-10 w-10 text-primary/40" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-[280px]">
                  {feedType === 'following'
                    ? 'Follow some creators to see their posts here.'
                    : 'Be the first to share something amazing!'}
                </p>
              </div>
            )
          }

          return (
            <>
              {posts.map((post, index) => (
                <ModernPostCard key={post.id} post={post} index={index} />
              ))}
              {hasNextPage && (
                <div ref={ref} className="flex justify-center py-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    className="rounded-full px-6"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}
