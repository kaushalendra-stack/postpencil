'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FeedList } from './feed-list'

const tabs = [
  { value: 'latest', label: 'For You' },
  { value: 'following', label: 'Following' },
  { value: 'trending', label: 'Trending' },
]

export function FeedTabs() {
  const [value, setValue] = useState('latest')

  return (
    <div>
      <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex gap-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setValue(tab.value)}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors relative',
                value === tab.value
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {value === tab.value && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>
      <FeedList feedType={value} />
    </div>
  )
}
