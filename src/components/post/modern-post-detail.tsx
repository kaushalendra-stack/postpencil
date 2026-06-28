'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Heart, Bookmark, Share2, Download, FileText, Image as ImageIcon, Presentation, Archive, Eye, Calendar, GraduationCap, BookOpen, Hash, Layers } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLikePost, useBookmarkPost } from '@/hooks/use-posts'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { ThreadNav } from '@/components/post/thread-nav'
import { ModernCommentSection } from '@/components/comments/modern-comment-section'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-6 w-6" />,
  image: <ImageIcon className="h-6 w-6" />,
  document: <FileText className="h-6 w-6" />,
  presentation: <Presentation className="h-6 w-6" />,
  zip: <Archive className="h-6 w-6" />,
}

const FILE_GRADIENTS: Record<string, string> = {
  pdf: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/20',
  image: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20',
  document: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/20',
  presentation: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/20',
  zip: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function handleShare(postId: string, title: string) {
  const url = window.location.origin + '/post/' + postId
  if (navigator.share) {
    try { await navigator.share({ title, url }) } catch {}
  } else {
    try { await navigator.clipboard.writeText(url); toast.success('Link copied to clipboard') } catch { toast.error('Failed to copy') }
  }
}

export function ModernPostDetail() {
  const { postId } = useParams() as { postId: string }
  const { data: post, isLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetch(`/api/posts/${postId}`).then((r) => r.json()),
    enabled: !!postId,
  })
  const likeMutation = useLikePost()
  const bookmarkMutation = useBookmarkPost()
  const { data: session } = useSession()
  const [threadData, setThreadData] = useState<{ count: number; threadTitle: string; posts: Array<{ id: string; threadOrder: number; title: string }> } | null>(null)

  useEffect(() => {
    if (post?.threadId) {
      fetch(`/api/posts/${post.id}/thread`)
        .then((r) => r.json())
        .then(setThreadData)
        .catch(() => {})
    }
  }, [post?.id, post?.threadId])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto p-4 space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-5/6 rounded-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-float-up">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-primary/40" />
          </div>
          <p className="text-lg font-bold">Post not found</p>
          <p className="text-sm text-muted-foreground mt-1">This post may have been removed</p>
        </div>
      </div>
    )
  }

  const pf = post.files?.[0]
  const fileGradient = FILE_GRADIENTS[pf?.fileType || 'document'] || 'from-muted/20 to-muted/20 text-muted-foreground border-border/20'

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
        {/* Thread navigation */}
        {threadData && threadData.count > 1 && (
          <ThreadNav
            threadTitle={threadData.threadTitle}
            threadOrder={post.threadOrder || 0}
            threadCount={threadData.count}
            postId={post.id}
            threadPosts={threadData.posts}
          />
        )}

        {/* Author card */}
        <Link href={`/user/${post.user.username}`} className="block rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 mb-4 transition-all duration-300 hover:border-border/70 hover:bg-card/80 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 animate-float-up stagger-1">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={post.user.image || ''} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                  {post.user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base">{post.user.name}</p>
              <p className="text-sm text-muted-foreground/60">@{post.user.username}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground/40 flex items-center gap-1 justify-end">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.createdAt)}
              </p>
              <p className="text-xs text-muted-foreground/40 flex items-center gap-1 justify-end mt-0.5">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(post.viewsCount)} views
              </p>
            </div>
          </div>
        </Link>

        {/* Title & description */}
        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 mb-4 animate-float-up stagger-2">
          <h2 className="text-2xl font-bold leading-tight mb-3">{post.title}</h2>
          {post.description && (
            <p className="text-muted-foreground/80 whitespace-pre-wrap leading-relaxed">{post.description}</p>
          )}
        </div>

        {/* Tags */}
        {(post.subject || post.course || post.semester || post.tags?.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4 animate-float-up stagger-3">
            {post.subject && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary/70 border border-primary/10">
                <BookOpen className="h-3.5 w-3.5" />
                {post.subject}
              </span>
            )}
            {post.course && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                {post.course}
              </span>
            )}
            {post.semester && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Sem {post.semester}
              </span>
            )}
            {post.tags?.map((t: { id: string; name: string }) => (
              <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Hash className="h-3 w-3" />
                {t.name}
              </span>
            ))}
          </div>
        )}

        {/* File list */}
        {post.files?.length > 0 && (
          <div className="mb-4 animate-float-up stagger-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wider px-1">
              {post.files.length} {post.files.length === 1 ? 'file' : 'files'}
            </p>
            {post.files.map((file: { id: string; fileUrl: string; originalName: string; fileType: string; fileSize: number }) => {
              const fg = FILE_GRADIENTS[file.fileType] || 'from-muted/20 to-muted/20 text-muted-foreground border-border/20'
              return (
                <Link
                  key={file.id}
                  href={`/view/${post.id}?file=${file.id}`} target="_blank"
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border bg-gradient-to-r p-[1px] transition-all duration-200 hover:opacity-90 hover:shadow-md hover:shadow-black/5 cursor-pointer',
                    fg
                  )}
                >
                  <div className="flex-1 flex items-center gap-4 rounded-[15px] bg-background/80 backdrop-blur-sm p-4">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br', fg)}>
                      {FILE_ICONS[file.fileType] || FILE_ICONS.document}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground/50 mt-0.5">
                        {file.fileType.toUpperCase()} · {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 mb-6 animate-float-up stagger-5">
          <button
            onClick={() => likeMutation.mutate(post.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium transition-all duration-200 border',
              post.isLiked
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                : 'bg-card/50 border-border/40 text-muted-foreground hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20'
            )}
          >
            <Heart className={cn('h-5 w-5 transition-all duration-200', post.isLiked && 'fill-current scale-110')} />
            <span>{formatNumber(post.likesCount)}</span>
          </button>

          <button
            onClick={() => bookmarkMutation.mutate(post.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium transition-all duration-200 border',
              post.isBookmarked
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-card/50 border-border/40 text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/20'
            )}
          >
            <Bookmark className={cn('h-5 w-5 transition-all duration-200', post.isBookmarked && 'fill-current')} />
            <span>{formatNumber(post.bookmarksCount)}</span>
          </button>

          <button
            onClick={() => handleShare(post.id, post.title)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium bg-card/50 border border-border/40 text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all duration-200"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground/40 mb-6 px-1 animate-float-up stagger-5">
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatNumber(post.viewsCount)} views</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(post.createdAt)}</span>
        </div>

        {/* Continue thread button (author only) */}
        {post.threadId && threadData && session?.user && session.user.id === post.user?.id && (
          <Link
            href="/upload"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-primary/80 hover:bg-primary/10 hover:text-primary transition-all duration-200 animate-float-up"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Continue this thread</p>
              <p className="text-xs text-primary/50">Add another part to this resource series</p>
            </div>
          </Link>
        )}

        {/* Comments */}
        <div className="border-t border-border/30 pt-6">
          <ModernCommentSection postId={post.id} />
        </div>

        {/* Related Posts */}
        <RelatedPosts postId={post.id} />
      </div>
    </div>
  )
}

function FileDownloadButton({ postId, fileUrl }: { postId: string; fileUrl: string }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/download`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Download failed')
        setDownloading(false)
        return
      }

      if (data.downloadsRemaining !== undefined) {
        toast.success(`Downloaded (${data.downloadsUsed}/10 today)`, { duration: 3000 })
      }

      const a = document.createElement('a')
      a.href = fileUrl
      a.download = ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      className="rounded-xl px-5"
    >
      <Download className="h-4 w-4 mr-2" />
      {downloading ? 'Downloading...' : 'Download'}
    </Button>
  )
}

function RelatedPosts({ postId }: { postId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['related-posts', postId],
    queryFn: () => fetch(`/api/posts/${postId}/related`).then((r) => r.json()),
    enabled: !!postId,
  })

  const related = data?.data ?? []

  if (isLoading || related.length === 0) return null

  return (
    <div className="border-t border-border/30 pt-6 mt-6">
      <h3 className="text-sm font-bold mb-4">Related Resources</h3>
      <div className="space-y-3">
        {related.map((post: { id: string; title: string; description: string | null; user?: { username: string }; likesCount: number; viewsCount: number }) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block rounded-xl border border-border/30 bg-card/30 p-4 hover:border-border/60 hover:bg-card/60 transition-all"
          >
            <p className="text-sm font-semibold line-clamp-1">{post.title}</p>
            {post.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/50">
              <span>{post.user?.username}</span>
              <span>&middot;</span>
              <span>{formatNumber(post.likesCount)} likes</span>
              <span>&middot;</span>
              <span>{formatNumber(post.viewsCount)} views</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
