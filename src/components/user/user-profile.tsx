'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useParams } from 'next/navigation'
import { Heart, Camera, GraduationCap, BookOpen, ExternalLink, Settings, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PostCard } from '@/components/post/post-card'
import { PostCardSkeleton } from '@/components/feed/post-card-skeleton'
import { useUser, useUserPosts, useFollowUser } from '@/hooks/use-user'
import { formatNumber, cn } from '@/lib/utils'
import type { PostWithUser } from '@/lib/types'

interface FollowerUser {
  id: string
  name: string | null
  username: string
  image: string | null
  bio: string | null
  followersCount: number
  postsCount: number
}

function FollowersModal({ open, onOpenChange, username, type }: { open: boolean; onOpenChange: (v: boolean) => void; username: string; type: 'followers' | 'following' }) {
  const { data, isLoading } = useQuery({
    queryKey: ['followers', username, type],
    queryFn: () => fetch(`/api/users/${username}/followers?type=${type}`).then((r) => r.json()),
    enabled: open,
  })

  const users: FollowerUser[] = data?.data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base">{type === 'followers' ? 'Followers' : 'Following'}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No {type} yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.username}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-xs">{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function UserProfile() {
  const { username } = useParams() as { username: string }
  const { data: session } = useSession()
  const { data: user, isLoading: isLoadingUser } = useUser(username)
  const { data: posts, isLoading: isLoadingPosts } = useUserPosts(username)
  const qc = useQueryClient()
  const followMutation = useFollowUser()
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState<'resources' | 'likes'>('resources')
  const bannerRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const [, setBannerPreview] = useState(user?.banner || '')
  const [avatarPreview, setAvatarPreview] = useState(user?.image || '')
  const [followersModal, setFollowersModal] = useState<{ open: boolean; type: 'followers' | 'following' }>({ open: false, type: 'followers' })

  const uploadMutation = useMutation({
    mutationFn: async (data: { banner?: string; image?: string }) => {
      const res = await fetch(`/api/users/${username}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users', username] }); toast.success('Profile updated') },
    onError: () => toast.error('Failed to update'),
  })

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) return null
      const data = await res.json()
      return data.fileUrl || null
    } catch {
      return null
    }
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    if (url) {
      setBannerPreview(url)
      uploadMutation.mutate({ banner: url })
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    if (url) {
      setAvatarPreview(url)
      uploadMutation.mutate({ image: url })
    }
  }

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
      <div className="h-36 sm:h-44 bg-gradient-to-br from-muted to-muted/60 relative group cursor-pointer" onClick={() => isOwnProfile && bannerRef.current?.click()}>
        {user.banner && <Image src={user.banner} alt="" fill sizes="100vw" className="object-cover" />}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" />Change banner</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
      </div>

      {/* Profile Info */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-end justify-between -mt-14 mb-4">
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
              <AvatarImage src={avatarPreview || undefined} alt={user.name || ''} />
              <AvatarFallback className="text-3xl font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button onClick={() => avatarRef.current?.click()} className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm"><Camera className="h-4 w-4" /></button>
            )}
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

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
          <button
            onClick={() => setFollowersModal({ open: true, type: 'followers' })}
            className="hover:underline"
          >
            <span className="font-semibold">{formatNumber(user.followersCount)}</span>{' '}
            <span className="text-muted-foreground">followers</span>
          </button>
          <button
            onClick={() => setFollowersModal({ open: true, type: 'following' })}
            className="hover:underline"
          >
            <span className="font-semibold">{formatNumber(user.followingCount)}</span>{' '}
            <span className="text-muted-foreground">following</span>
          </button>
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

      <FollowersModal
        open={followersModal.open}
        onOpenChange={(open) => setFollowersModal({ ...followersModal, open })}
        username={username}
        type={followersModal.type}
      />
    </div>
  )
}
