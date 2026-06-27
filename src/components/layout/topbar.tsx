'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Menu } from 'lucide-react'

interface TopBarProps {
  title?: string
  onMenuClick?: () => void
  showBack?: boolean
  rightContent?: React.ReactNode
}

export function TopBar({ title, onMenuClick, showBack = false, rightContent }: TopBarProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => router.back()} aria-label="Go back" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {onMenuClick && (
          <button onClick={onMenuClick} aria-label="Open menu" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
        )}
      </div>
      {rightContent && (
        <div className="ml-auto flex items-center gap-2">{rightContent}</div>
      )}
    </header>
  )
}
