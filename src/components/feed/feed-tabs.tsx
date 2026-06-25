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
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setValue(tab.value)}
              className={cn(
                'flex-1 py-3 text-[13px] font-semibold transition-all duration-200 relative',
                value === tab.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
              )}
            >
              {tab.label}
              <span className={cn('absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-foreground transition-all duration-300 ease-out', value === tab.value ? 'w-12 opacity-100' : 'w-0 opacity-0')} />
            </button>
          ))}
        </div>
      </div>
      <FeedList feedType={value} />
    </div>
  )
}
