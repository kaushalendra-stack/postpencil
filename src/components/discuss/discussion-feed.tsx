'use client'

import { useState } from 'react'
import { useDiscussionFeed } from '@/hooks/use-discussions'
import { DiscussionCard } from './discussion-card'
import { DiscussionCompose } from './discussion-compose'
import { useInView } from 'react-intersection-observer'
import { Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = ['For you', 'Following'] as const

export function DiscussionFeed() {
  const [activeTab, setActiveTab] = useState<'For you' | 'Following'>('For you')
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useDiscussionFeed(
    activeTab === 'For you' ? 'for-you' : 'following'
  )
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
  })

  return (
    <div className="max-w-[620px] mx-auto px-4">
      {/* Tabs */}
      <div className="sticky top-0 z-40 -mx-4 bg-background/80 backdrop-blur-xl border-b border-border/25">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-3.5 text-[15px] font-medium relative transition-colors duration-200',
                activeTab === tab
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-muted/20'
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[3px] rounded-full bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      <div className="py-4">
        <DiscussionCompose />
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border/25 bg-card/80 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded-full bg-muted" />
                  <div className="h-2.5 w-16 rounded-full bg-muted/60" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded-full bg-muted/60" />
                <div className="h-3.5 w-3/4 rounded-full bg-muted/60" />
                <div className="h-3.5 w-1/2 rounded-full bg-muted/60" />
              </div>
              <div className="flex gap-6 mt-4 pt-3 border-t border-border/15">
                <div className="h-3 w-10 rounded-full bg-muted/40" />
                <div className="h-3 w-10 rounded-full bg-muted/40" />
                <div className="h-3 w-8 rounded-full bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      ) : (() => {
        const discussions = data?.pages.flatMap((page) => page.data) ?? []

        if (discussions.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-40 text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border/30 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary/25" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {activeTab === 'Following' ? 'No posts from people you follow' : 'No discussions yet'}
              </h3>
              <p className="text-sm text-muted-foreground/50 max-w-[280px] leading-relaxed">
                {activeTab === 'Following'
                  ? 'When you follow people, their posts will show up here.'
                  : 'Share your thoughts, ask questions, or start a conversation with the community.'}
              </p>
            </div>
          )
        }

        return (
          <div className="space-y-1">
            {discussions.map((discussion, index) => (
              <DiscussionCard key={discussion.id} discussion={discussion} index={index} />
            ))}
            {hasNextPage && (
              <div ref={ref} className="flex justify-center py-10">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/30">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground/50">Loading more</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
