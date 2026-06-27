'use client'

import { useDiscussionFeed } from '@/hooks/use-discussions'
import { DiscussionCard } from './discussion-card'
import { DiscussionCompose } from './discussion-compose'
import { Button } from '@/components/ui/button'
import { useInView } from 'react-intersection-observer'
import { Loader2, MessageSquare } from 'lucide-react'

export function DiscussionFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useDiscussionFeed()
  const { ref } = useInView()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4">
        <DiscussionCompose />

        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-4 animate-pulse border-b border-border/20">
                <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-20 rounded-full bg-muted" />
                    <div className="h-3 w-14 rounded-full bg-muted" />
                  </div>
                  <div className="h-4 w-full rounded-lg bg-muted" />
                  <div className="h-4 w-5/6 rounded-lg bg-muted" />
                  <div className="flex gap-3 pt-1">
                    <div className="h-6 w-12 rounded-full bg-muted" />
                    <div className="h-6 w-14 rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (() => {
          const discussions = data?.pages.flatMap((page) => page.data) ?? []

          if (discussions.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-20 animate-float-up">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-primary/30" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">No discussions yet</h3>
                <p className="text-sm text-muted-foreground/60 text-center max-w-[280px]">
                  Start a conversation! Ask questions, share tips, or discuss ideas.
                </p>
              </div>
            )
          }

          return (
            <>
              <div className="divide-y divide-border/20">
                {discussions.map((discussion, index) => (
                  <DiscussionCard key={discussion.id} discussion={discussion} index={index} />
                ))}
              </div>
              {hasNextPage && (
                <div ref={ref} className="flex justify-center py-8">
                  <Button variant="ghost" size="sm" disabled={isFetchingNextPage} onClick={() => fetchNextPage()} className="rounded-full px-6">
                    {isFetchingNextPage ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading...</>
                    ) : 'Load more'}
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
