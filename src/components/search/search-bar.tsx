'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Hash, FileText, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

interface SearchBarProps {
  defaultValue?: string
  onSubmit?: (query: string) => void
  placeholder?: string
  className?: string
}

interface Suggestion {
  id: string
  name: string
  type: 'tag' | 'post'
  slug?: string
  count?: number
}

export function SearchBar({
  defaultValue = '',
  onSubmit,
  placeholder = 'Search resources...',
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('recentSearches')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: suggestions } = useQuery({
    queryKey: ['autocomplete', value],
    queryFn: () => fetch(`/api/search/autocomplete?q=${encodeURIComponent(value)}`).then((r) => r.json()),
    enabled: value.length >= 2 && showSuggestions,
    staleTime: 30000,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      saveRecentSearch(trimmed)
      onSubmit?.(trimmed)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'tag') {
      onSubmit?.(suggestion.name)
    } else {
      saveRecentSearch(suggestion.name)
      onSubmit?.(suggestion.name)
    }
    setShowSuggestions(false)
  }

  const handleRecentClick = (query: string) => {
    setValue(query)
    onSubmit?.(query)
    setShowSuggestions(false)
  }

  const clear = () => {
    setValue('')
    inputRef.current?.focus()
    onSubmit?.('')
  }

  const items = suggestions?.suggestions ?? []
  const hasSuggestions = items.length > 0 || recentSearches.length > 0

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-input bg-muted/30 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showSuggestions && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border/50 bg-background shadow-lg z-50 overflow-hidden">
          {recentSearches.length > 0 && !value && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Recent</p>
              {recentSearches.map((query) => (
                <button
                  key={query}
                  onClick={() => handleRecentClick(query)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {query}
                </button>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="p-2">
              {recentSearches.length > 0 && !value && <div className="border-t border-border/30 my-1" />}
              {items.map((item: Suggestion) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.type === 'post' ? `/post/${item.id}` : `/search?q=${item.name}`}
                  onClick={() => handleSuggestionClick(item)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                >
                  {item.type === 'tag' ? (
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="truncate">{item.name}</span>
                  {item.count !== undefined && (
                    <span className="ml-auto text-xs text-muted-foreground/50">{item.count}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
