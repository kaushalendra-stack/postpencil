'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageCircle, Bookmark, Share2, FileText, Image as ImageIcon, Presentation, Archive, Download, Eye } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useLikePost, useBookmarkPost } from '@/hooks/use-posts'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PostWithUser } from '@/lib/types'

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  presentation: <Presentation className="h-4 w-4" />,
  zip: <Archive className="h-4 w-4" />,
}

const FILE_GRADIENTS: Record<string, string> = {
  pdf: 'from-rose-500/20 to-pink-500/20 text-rose-400',
  image: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
  document: 'from-indigo-500/20 to-violet-500/20 text-indigo-400',
  presentation: 'from-orange-500/20 to-amber-500/20 text-orange-400',
  zip: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

async function handleShare(postId: string, title: string) {
  const url = window.location.origin + '/post/' + postId
  if (navigator.share) {
    try { await navigator.share({ title, url }) } catch {}
  } else {
    try { await navigator.clipboard.writeText(url); toast.success('Link copied to clipboard', { duration: 1200 }) } catch { toast.error('Failed to copy') }
  }
}

export function ModernPostCard({ post, index = 0 }: { post: PostWithUser; index?: number }) {
  const router = useRouter()
  const likeMutation = useLikePost()
  const bookmarkMutation = useBookmarkPost()
  const file = post.files?.[0]
  const fileIcon = FILE_ICONS[file?.fileType || 'document'] || FILE_ICONS.document
  const fileGradient = FILE_GRADIENTS[file?.fileType || 'document'] || 'from-muted/20 to-muted/20 text-muted-foreground'

  return (
    <article
      className={cn(
        'group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm',
        'p-5 transition-all duration-300 ease-out',
        'hover:border-border/80 hover:bg-card/80 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        'hover:-translate-y-0.5',
        'animate-float-up',
        index < 10 && `stagger-${index + 1}`
      )}
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <div className="flex gap-4">
        <Link href={`/user/${post.user.username}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Avatar className="h-11 w-11 transition-transform duration-300 group-hover:scale-105">
            <AvatarImage src={post.user.image || ''} />
            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
              {post.user.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Link href={`/user/${post.user.username}`} onClick={(e) => e.stopPropagation()} className="text-sm font-semibold text-foreground hover:underline underline-offset-2 truncate">
              {post.user.name}
            </Link>
            <span className="text-xs text-muted-foreground/50">@{post.user.username}</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground/50 shrink-0">{formatDate(post.createdAt)}</span>
          </div>

          <h3 className="text-[15px] font-semibold leading-snug mb-1.5 group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>

          {post.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed mb-3">
              {post.description}
            </p>
          )}

          {(post.subject || post.course) && (
            <div className="flex items-center gap-2 mb-3">
              {post.subject && (
                <span className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary/80 border border-primary/10">
                  {post.subject}
                </span>
              )}
              {post.course && (
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                  {post.course}
                </span>
              )}
              {post.semester && (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Sem {post.semester}
                </span>
              )}
            </div>
          )}

          {file && (
            <div className={cn(
              'relative overflow-hidden rounded-xl bg-gradient-to-r p-[1px] mb-3',
              fileGradient
            )}>
              <div className="flex items-center gap-3 rounded-[11px] bg-background/80 backdrop-blur-sm px-4 py-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br', fileGradient)}>
                  {fileIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {file.fileType.toUpperCase()} · {formatFileSize(file.fileSize)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground/40">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Download className="h-3.5 w-3.5" />
                    {formatNumber(post.downloadsCount)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Eye className="h-3.5 w-3.5" />
                    {formatNumber(post.viewsCount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 -ml-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); likeMutation.mutate(post.id) }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                post.isLiked
                  ? "text-rose-500 bg-rose-500/10"
                  : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
              )}
            >
              <Heart className={cn("h-4 w-4 transition-all duration-200", post.isLiked && "fill-current scale-110")} />
              <span className="tabular-nums">{formatNumber(post.likesCount)}</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="tabular-nums">{formatNumber(post.commentsCount)}</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); bookmarkMutation.mutate(post.id); toast.success(post.isBookmarked ? 'Removed' : 'Saved', { duration: 1200 }) }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                post.isBookmarked
                  ? "text-emerald-500 bg-emerald-500/10"
                  : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
              )}
            >
              <Bookmark className={cn("h-4 w-4 transition-all duration-200", post.isBookmarked && "fill-current")} />
              <span className="tabular-nums">{formatNumber(post.bookmarksCount)}</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(post.id, post.title) }}
              className="inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
