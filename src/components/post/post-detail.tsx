'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Download, FileText, Image as ImageIcon, Presentation, Archive } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLikePost, useBookmarkPost } from '@/hooks/use-posts'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { CommentSection } from '@/components/comments/comment-section'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

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

export function PostDetail() {
  const { postId } = useParams() as { postId: string }
  const { data: post, isLoading } = useQuery({ queryKey: ['posts', postId], queryFn: () => fetch(`/api/posts/${postId}`).then((r) => r.json()), enabled: !!postId })
  const likeMutation = useLikePost()
  const bookmarkMutation = useBookmarkPost()

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-14 border-b border-border/50 flex items-center px-4"><Skeleton className="h-5 w-20" /></div>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div>
          <Skeleton className="h-7 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!post) return <div className="min-h-screen flex items-center justify-center"><p className="text-lg font-semibold">Post not found</p></div>

  const pf = post.files?.[0]

  return (
    <div className="min-h-screen">
      <div className="h-14 border-b border-border/50 flex items-center px-4 gap-3 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={() => history.back()} className="h-9 w-9 -ml-1"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-bold text-lg">Resource</h1>
      </div>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Link href={`/user/${post.user.username}`} className="flex items-center gap-3">
          <Avatar className="h-12 w-12"><AvatarImage src={post.user.image || ''} /><AvatarFallback>{post.user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}</AvatarFallback></Avatar>
          <div><p className="font-semibold">{post.user.name}</p><p className="text-muted-foreground text-sm">@{post.user.username}</p></div>
        </Link>
        <div><h2 className="text-2xl font-bold mb-2">{post.title}</h2>{post.description && <p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>}</div>
        <div className="flex flex-wrap gap-2">
          {post.subject && <Badge variant="secondary">{post.subject}</Badge>}
          {post.course && <Badge variant="outline">{post.course}</Badge>}
          {post.semester && <Badge variant="outline">{post.semester}</Badge>}
          {post.tags?.map((t: { id: string; name: string }) => <Badge key={t.id} variant="secondary" className="rounded-full">#{t.name}</Badge>)}
        </div>
        {pf && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
            <div className="shrink-0">{pf.fileType === 'image' ? <ImageIcon className="h-10 w-10 text-blue-500" /> : pf.fileType === 'pdf' ? <FileText className="h-10 w-10 text-red-500" /> : pf.fileType === 'presentation' ? <Presentation className="h-10 w-10 text-orange-500" /> : <Archive className="h-10 w-10 text-purple-500" />}</div>
            <div className="flex-1 min-w-0"><p className="font-medium truncate">{pf.originalName}</p><p className="text-sm text-muted-foreground">{pf.fileType.toUpperCase()} · {formatFileSize(pf.fileSize)}</p></div>
            <Button asChild><a href={pf.fileUrl} download><Download className="h-4 w-4 mr-1" />Download</a></Button>
          </div>
        )}
        <div className="flex items-center gap-1 border-y border-border/50 py-2">
          <Button variant="ghost" onClick={() => likeMutation.mutate(post.id)}><Heart className={cn('h-5 w-5 mr-1', post.isLiked && 'fill-red-500 text-red-500')} />{formatNumber(post.likesCount)}</Button>
          <Button variant="ghost"><MessageCircle className="h-5 w-5 mr-1" />{formatNumber(post.commentsCount)}</Button>
          <Button variant="ghost" onClick={() => bookmarkMutation.mutate(post.id)}><Bookmark className={cn('h-5 w-5 mr-1', post.isBookmarked && 'fill-green-500 text-green-500')} />{formatNumber(post.bookmarksCount)}</Button>
          <Button variant="ghost" className="ml-auto" onClick={() => handleShare(post.id, post.title)}><Share2 className="h-5 w-5 mr-1" />Share</Button>
        </div>
        <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)} · {formatNumber(post.viewsCount)} views</p>
      </div>
      <div className="border-t border-border/50"><CommentSection postId={post.id} /></div>
    </div>
  )
}
