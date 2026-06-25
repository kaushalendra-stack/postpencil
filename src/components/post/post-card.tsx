'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageCircle, Bookmark, Share2, FileText, Image as ImageIcon, Presentation, Archive } from 'lucide-react'
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
const FILE_COLORS: Record<string, string> = {
  pdf: 'text-red-500 bg-red-500/10',
  image: 'text-blue-500 bg-blue-500/10',
  document: 'text-blue-600 bg-blue-600/10',
  presentation: 'text-orange-500 bg-orange-500/10',
  zip: 'text-yellow-600 bg-yellow-600/10',
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

export function PostCard({ post }: { post: PostWithUser }) {
  const router = useRouter()
  const likeMutation = useLikePost()
  const bookmarkMutation = useBookmarkPost()
  const file = post.files?.[0]
  const fileIcon = FILE_ICONS[file?.fileType || 'document'] || FILE_ICONS.document
  const fileColor = FILE_COLORS[file?.fileType || 'document'] || 'text-muted-foreground bg-muted'

  return (
    <div className="border-b border-border/30 last:border-0">
      <article className="group px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors duration-150" onClick={() => router.push(`/post/${post.id}`)}>
        <div className="flex gap-3">
          <Link href={`/user/${post.user.username}`} onClick={(e) => e.stopPropagation()} className="shrink-0 mt-0.5">
            <Avatar className="h-9 w-9"><AvatarImage src={post.user.image || ''} /><AvatarFallback className="text-[10px] font-semibold bg-muted">{post.user.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback></Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Link href={`/user/${post.user.username}`} onClick={(e) => e.stopPropagation()} className="text-[13px] font-semibold text-foreground hover:underline underline-offset-2 truncate">{post.user.name}</Link>
              <span className="text-[13px] text-muted-foreground/50 truncate">@{post.user.username}</span>
              <span className="text-muted-foreground/30 text-[13px]">·</span>
              <span className="text-[13px] text-muted-foreground/50 shrink-0">{formatDate(post.createdAt)}</span>
            </div>
            <h3 className="text-sm font-semibold leading-snug mb-0.5 group-hover:text-primary transition-colors duration-150">{post.title}</h3>
            {post.description && <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">{post.description}</p>}
            {(post.subject || post.course) && (
              <div className="flex items-center gap-1 mb-2">
                {post.subject && <span className="inline-flex items-center rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{post.subject}</span>}
                {post.course && <span className="inline-flex items-center rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{post.course}</span>}
              </div>
            )}
            {file && (
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2 mb-2.5">
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-md text-xs', fileColor)}>{fileIcon}</div>
                <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{file.originalName}</p><p className="text-[10px] text-muted-foreground/60">{file.fileType.toUpperCase()} · {formatFileSize(file.fileSize)}</p></div>
              </div>
            )}
            <div className="flex items-center gap-0.5 -ml-1.5">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); likeMutation.mutate(post.id) }} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-all duration-150", post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500")}>
                <Heart className={cn("h-3.5 w-3.5 transition-all duration-200", post.isLiked && "fill-current")} /><span className="tabular-nums">{formatNumber(post.likesCount)}</span>
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-blue-500 transition-all duration-150">
                <MessageCircle className="h-3.5 w-3.5" /><span className="tabular-nums">{formatNumber(post.commentsCount)}</span>
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); bookmarkMutation.mutate(post.id); toast.success(post.isBookmarked ? 'Removed' : 'Saved', { duration: 1200 }) }} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-all duration-150", post.isBookmarked ? "text-emerald-500" : "text-muted-foreground hover:text-emerald-500")}>
                <Bookmark className={cn("h-3.5 w-3.5 transition-all duration-200", post.isBookmarked && "fill-current")} /><span className="tabular-nums">{formatNumber(post.bookmarksCount)}</span>
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(post.id, post.title) }} className="inline-flex items-center rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-all duration-150">
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
