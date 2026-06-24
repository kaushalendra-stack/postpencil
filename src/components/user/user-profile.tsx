'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Heart, GraduationCap, BookOpen, ExternalLink, Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/post/post-card'
import { PostCardSkeleton } from '@/components/feed/post-card-skeleton'
import { useUser, useUserPosts, useFollowUser } from '@/hooks/use-user'
import { formatNumber, cn } from '@/lib/utils'
import type { PostWithUser } from '@/lib/types'

export function UserProfile() {
  const { username } = useParams() as { username: string }
  const { data: session } = useSession()
  const { data: user, isLoading: isLoadingUser } = useUser(username)
  const { data: posts, isLoading: isLoadingPosts } = useUserPosts(username)
  const followMutation = useFollowUser()
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState<'resources' | 'likes'>('resources')

  const isOwnProfile = session?.user?.id === user?.id

  const handleFollow = () => {
    followMutation.mutate(username, {
      onSuccess: (data) => setIsFollowing(data.isFollowing),
    })
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen">
        <div className="h-40 bg-muted animate-pulse" />
        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <Skeleton className="h-28 w-28 rounded-full border-4 border-background" />
            <Skeleton className="h-9 w-24 rounded-xl mt-14" />
          </div>
          <Skeleton className="h-5 w-36 mb-1.5" />
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-4 w-56 mb-4" />
          <div className="flex gap-5 mb-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="border-t border-border/40">
            <div className="flex">
              <Skeleton className="h-12 flex-1 rounded-none" />
              <Skeleton className="h-12 flex-1 rounded-none" />
            </div>
          </div>
          <div className="py-4 space-y-3">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold">User not found</p>
          <p className="text-muted-foreground text-sm">This user doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const postsList = posts?.data ?? posts ?? []
  const likedPosts = postsList.filter((p: PostWithUser) => p.isLiked)
  const displayPosts = activeTab === 'resources' ? postsList : likedPosts

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-36 sm:h-44 bg-gradient-to-br from-muted to-muted/60 relative">
        {user.banner && (
          <img
            src={user.banner}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar + Actions */}
        <div className="flex items-end justify-between -mt-14 mb-4">
          <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
            <AvatarImage src={user.image || undefined} alt={user.name || ''} />
            <AvatarFallback className="text-3xl font-semibold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 mt-16">
            {isOwnProfile ? (
              <Button variant="outline" className="rounded-xl h-9 px-4 text-sm" asChild>
                <Link href="/settings">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Edit Profile
                </Link>
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                className="rounded-xl h-9 px-6 text-sm"
                disabled={followMutation.isPending}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Name & Username */}
        <h1 className="text-xl font-bold tracking-tight">{user.name || 'Anonymous'}</h1>
        <p className="text-sm text-muted-foreground">@{user.username}</p>

        {/* Bio */}
        {user.bio && (
          <p className="mt-3 text-sm leading-relaxed">{user.bio}</p>
        )}

        {/* Education */}
        {(user.college || user.course) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-muted-foreground">
            {user.college && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {user.college}
              </span>
            )}
            {user.course && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {user.course}{user.semester && ` · ${user.semester}`}
              </span>
            )}
          </div>
        )}

        {/* Social Links */}
        {(() => {
          const links = [
            { url: user.twitterUrl, label: 'Twitter' },
            { url: user.githubUrl, label: 'GitHub' },
            { url: user.linkedinUrl, label: 'LinkedIn' },
            { url: user.websiteUrl, label: 'Website' },
          ].filter((l) => l.url)

          if (links.length === 0) return null

          return (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          )
        })()}

        {/* Stats */}
        <div className="flex items-center gap-5 mt-4 text-sm">
          <span>
            <span className="font-semibold">{formatNumber(user.postsCount)}</span>{' '}
            <span className="text-muted-foreground">posts</span>
          </span>
          <span>
            <span className="font-semibold">{formatNumber(user.followersCount)}</span>{' '}
            <span className="text-muted-foreground">followers</span>
          </span>
          <span>
            <span className="font-semibold">{formatNumber(user.followingCount)}</span>{' '}
            <span className="text-muted-foreground">following</span>
          </span>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="border-t border-border/40 mt-6">
        <div className="max-w-2xl mx-auto">
          {/* Tab Bar */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('resources')}
              className={cn(
                "flex-1 h-12 text-sm font-medium transition-colors relative",
                activeTab === 'resources' ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              Resources
              {activeTab === 'resources' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={cn(
                "flex-1 h-12 text-sm font-medium transition-colors relative",
                activeTab === 'likes' ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                Likes
              </span>
              {activeTab === 'likes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          </div>

          {/* Posts */}
          <div className="divide-y divide-border/40">
            {isLoadingPosts ? (
              <div className="py-4 space-y-3">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : displayPosts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'resources' ? 'No resources shared yet' : 'No liked resources yet'}
                </p>
              </div>
            ) : (
              displayPosts.map((post: PostWithUser) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
