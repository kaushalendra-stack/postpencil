'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Bookmark,
  FolderPlus,
  FileText,
  Heart,
  MessageCircle,
  Download,
} from 'lucide-react'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BookmarkItem {
  bookmarkId: string
  createdAt: string
  post: {
    id: string
    title: string
    description: string | null
    resourceType: string
    likesCount: number
    commentsCount: number
    downloadsCount: number
    viewsCount: number
    createdAt: string
    user: {
      id: string
      name: string
      username: string
      image: string | null
    }
    files: { id: string; originalName: string; mimeType: string }[]
    tags: { id: string; name: string; slug: string }[]
  }
}

interface Collection {
  id: string
  name: string
  description: string | null
  createdAt: string
}

export function BookmarkCollections() {
  const queryClient = useQueryClient()
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newName, setNewName] = useState('')

  const { data: collectionsData, isLoading: collectionsLoading } = useQuery({
    queryKey: ['bookmarks', 'collections'],
    queryFn: async () => {
      const res = await fetch('/api/bookmarks/collections')
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: bookmarksData, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['bookmarks', selectedCollection],
    queryFn: async () => {
      const url = selectedCollection
        ? `/api/bookmarks?collectionId=${selectedCollection}`
        : '/api/bookmarks'
      const res = await fetch(url)
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      fetch('/api/bookmarks/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('Collection created')
      setShowCreateDialog(false)
      setNewName('')
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'collections'] })
    },
    onError: () => toast.error('Failed to create collection'),
  })

  const collections: Collection[] = Array.isArray(collectionsData)
    ? collectionsData
    : Array.isArray(collectionsData?.data)
    ? collectionsData.data
    : []

  const bookmarkItems: BookmarkItem[] = Array.isArray(bookmarksData)
    ? bookmarksData
    : Array.isArray(bookmarksData?.data)
    ? bookmarksData.data
    : []

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {bookmarkItems.length} saved resource{bookmarkItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="rounded-xl h-9"
            size="sm"
          >
            <FolderPlus className="h-4 w-4 mr-1.5" />
            New Collection
          </Button>
        </div>

        {/* Collections Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedCollection(null)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              !selectedCollection
                ? 'bg-foreground text-background'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            )}
          >
            All
          </button>
          {collectionsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-lg" />
            ))
          ) : (
            collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  selectedCollection === collection.id
                    ? 'bg-foreground text-background'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                )}
              >
                {collection.name}
              </button>
            ))
          )}
        </div>

        {/* Bookmarks List */}
        {bookmarksLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : bookmarkItems.length === 0 ? (
          <div className="py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
              <Bookmark className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No bookmarks yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Save resources to find them later
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarkItems.map((item) => {
              const post = item.post
              const file = post.files?.[0]
              return (
                <Link key={item.bookmarkId} href={`/post/${post.id}`}>
                  <div className="rounded-xl border border-border/40 p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 shrink-0 mt-0.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        {post.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {post.description}
                          </p>
                        )}
                        {file && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground/70 truncate">
                            {file.originalName}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/70">
                          <span>{post.user.username}</span>
                          <span>·</span>
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="ml-auto flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatNumber(post.likesCount)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {formatNumber(post.commentsCount)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {formatNumber(post.downloadsCount)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base">Create Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="h-10 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  createMutation.mutate(newName.trim())
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="rounded-xl h-10 flex-1"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newName.trim()) createMutation.mutate(newName.trim())
                }}
                disabled={!newName.trim() || createMutation.isPending}
                className="rounded-xl h-10 flex-1"
                size="sm"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
