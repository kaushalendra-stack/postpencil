'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Download, FileText, Image as ImageIcon, File, Presentation, Archive } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLikePost, useBookmarkPost } from '@/hooks/use-posts'
import { cn, formatDate, formatNumber, formatFileSize } from '@/lib/utils'
import { CommentSection } from '@/components/comments/comment-section'
import { useQuery } from '@tanstack/react-query'

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" aria-hidden="true" />,
  image: <ImageIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />,
  document: <FileText className="h-5 w-5 text-blue-600" />,
  presentation: <Presentation className="h-5 w-5 text-orange-500" />,
  archive: <Archive className="h-5 w-5 text-yellow-600" />,
  default: <File className="h-5 w-5 text-gray-500" />,
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return fileTypeIcons.image
  if (mimeType === 'application/pdf') return fileTypeIcons.pdf
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return fileTypeIcons.presentation
  if (mimeType.includes('document') || mimeType.includes('word')) return fileTypeIcons.document
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return fileTypeIcons.archive
  return fileTypeIcons.default
}

export function PostDetail() {
  const { postId } = useParams() as { postId: string };
  const { data: post, isLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetch(`/api/posts/${postId}`).then((res) => res.json()),
    enabled: !!postId,
  })

  const likeMutation = useLikePost()
  const bookmarkMutation = useBookmarkPost()

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-20" />
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    )
  }

  const handleLike = () => likeMutation.mutate(post.id)
  const handleBookmark = () => bookmarkMutation.mutate(post.id)

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/home">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.user.username}`}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.user.image || undefined} alt={post.user.name || ''} />
                <AvatarFallback>{post.user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                href={`/user/${post.user.username}`}
                className="font-semibold hover:underline"
              >
                {post.user.name || 'Anonymous'}
              </Link>
              <p className="text-sm text-muted-foreground">
                @{post.user.username} · {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{post.title}</h1>

            <div className="flex flex-wrap gap-2 mt-3">
              {post.subject && (
                <Badge variant="secondary">{post.subject}</Badge>
              )}
              {post.course && (
                <Badge variant="secondary">{post.course}</Badge>
              )}
              {post.semester && (
                <Badge variant="secondary">{post.semester}</Badge>
              )}
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {post.description && (
            <div className="text-sm whitespace-pre-wrap">
              {post.description}
            </div>
          )}

          {post.files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Files</h3>
              {post.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.mimeType)}
                    <div>
                      <p className="text-sm font-medium">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={file.fileUrl} download={file.originalName}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-2',
                post.isLiked && 'text-red-500 hover:text-red-600'
              )}
              onClick={handleLike}
            >
              <Heart className={cn('h-5 w-5', post.isLiked && 'fill-current')} />
              <span>{formatNumber(post.likesCount)} likes</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>{formatNumber(post.commentsCount)} comments</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-2',
                post.isBookmarked && 'text-yellow-500 hover:text-yellow-600'
              )}
              onClick={handleBookmark}
            >
              <Bookmark className={cn('h-5 w-5', post.isBookmarked && 'fill-current')} />
              <span>Save</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2 ml-auto">
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CommentSection postId={post.id} />
    </div>
  )
}
