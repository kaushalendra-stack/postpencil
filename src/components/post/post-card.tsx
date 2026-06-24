'use client'

import Link from 'next/link'
import { Heart, MessageCircle, Bookmark, Share2, FileText, Image as ImageIcon, File, Presentation, Archive } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useLikePost, useBookmarkPost } from '@/hooks/use-posts'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type { PostWithUser } from '@/lib/types'

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4 text-red-500" aria-hidden="true" />,
  image: <ImageIcon className="h-4 w-4 text-blue-500" aria-hidden="true" />,
  document: <FileText className="h-4 w-4 text-blue-600" />,
  presentation: <Presentation className="h-4 w-4 text-orange-500" />,
  archive: <Archive className="h-4 w-4 text-yellow-600" />,
  default: <File className="h-4 w-4 text-gray-500" />,
}

interface PostCardProps {
  post: PostWithUser
}

export function PostCard({ post }: PostCardProps) {
  const likeMutation = useLikePost()
  const bookmarkMutation = useBookmarkPost()

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    likeMutation.mutate(post.id)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    bookmarkMutation.mutate(post.id)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return fileTypeIcons.image
    if (mimeType === 'application/pdf') return fileTypeIcons.pdf
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return fileTypeIcons.presentation
    if (mimeType.includes('document') || mimeType.includes('word')) return fileTypeIcons.document
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return fileTypeIcons.archive
    return fileTypeIcons.default
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/post/${post.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Link
              href={`/user/${post.user.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user.image || undefined} alt={post.user.name || ''} />
                <AvatarFallback>{post.user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href={`/user/${post.user.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold hover:underline truncate"
                >
                  {post.user.name || 'Anonymous'}
                </Link>
                <span className="text-muted-foreground truncate">@{post.user.username}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground flex-shrink-0">{formatDate(post.createdAt)}</span>
              </div>

              <h3 className="font-semibold mt-2 line-clamp-2">{post.title}</h3>

              {post.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {post.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {post.subject && (
                  <Badge variant="secondary" className="text-xs">
                    {post.subject}
                  </Badge>
                )}
                {post.course && (
                  <Badge variant="secondary" className="text-xs">
                    {post.course}
                  </Badge>
                )}
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>

              {post.files.length > 0 && (
                <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-muted/50">
                  {getFileIcon(post.files[0].mimeType)}
                  <span className="text-xs text-muted-foreground truncate">
                    {post.files[0].originalName}
                  </span>
                  {post.files.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      +{post.files.length - 1} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex items-center gap-1 w-full">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex-1 gap-2',
              post.isLiked && 'text-red-500 hover:text-red-600'
            )}
            onClick={handleLike}
          >
            <Heart
              className={cn('h-4 w-4', post.isLiked && 'fill-current')}
            />
            <span className="text-xs">{formatNumber(post.likesCount)}</span>
          </Button>

          <Button variant="ghost" size="sm" className="flex-1 gap-2" asChild>
            <Link href={`/post/${post.id}`}>
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{formatNumber(post.commentsCount)}</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex-1 gap-2',
              post.isBookmarked && 'text-yellow-500 hover:text-yellow-600'
            )}
            onClick={handleBookmark}
          >
            <Bookmark
              className={cn('h-4 w-4', post.isBookmarked && 'fill-current')}
            />
          </Button>

          <Button variant="ghost" size="sm" className="flex-1 gap-2">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
