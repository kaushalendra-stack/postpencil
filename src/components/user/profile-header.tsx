'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { GraduationCap, BookOpen, Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useFollowUser } from '@/hooks/use-user'
import { formatNumber } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { UserProfile } from '@/lib/types'

interface ProfileHeaderProps {
  user: UserProfile
  isOwnProfile?: boolean
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function ProfileHeader({ user, isOwnProfile = false, isFollowing = false, onFollowChange }: ProfileHeaderProps) {
  const followMutation = useFollowUser()
  const qc = useQueryClient()
  const bannerRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  const [bannerPreview, setBannerPreview] = useState(user.banner || '')
  const [avatarPreview, setAvatarPreview] = useState(user.image || '')

  const uploadMutation = useMutation({
    mutationFn: async (data: { banner?: string; image?: string }) => {
      const res = await fetch(`/api/users/${user.username}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users', user.username] }); toast.success('Profile updated'); },
    onError: () => toast.error('Failed to update profile'),
  })

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setBannerPreview(url)
    uploadMutation.mutate({ banner: url })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
    uploadMutation.mutate({ image: url })
  }

  const handleFollow = () => {
    followMutation.mutate(user.username, { onSuccess: (data) => { onFollowChange?.(data.isFollowing) } })
  }

  return (
    <div>
      {/* Banner */}
      <div
        className="h-48 bg-gradient-to-br from-muted to-muted/50 relative group cursor-pointer"
        style={bannerPreview ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        onClick={() => isOwnProfile && bannerRef.current?.click()}
      >
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Change banner
            </div>
          </div>
        )}
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
      </div>

      <div className="px-4 pb-4">
        <div className="flex justify-between items-end -mt-16 mb-3">
          {/* Avatar with upload */}
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={avatarPreview || undefined} alt={user.name || ''} />
              <AvatarFallback className="text-3xl font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button onClick={() => avatarRef.current?.click()} className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm">
                <Camera className="h-4 w-4" />
              </button>
            )}
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex gap-2 mt-16">
            {isOwnProfile ? (
              <Button variant="outline" className="rounded-full h-9 px-4 text-sm" asChild><Link href="/settings">Edit Profile</Link></Button>
            ) : (
              <Button variant={isFollowing ? 'outline' : 'default'} className="rounded-full h-9 px-5 text-sm" disabled={followMutation.isPending} onClick={handleFollow}>{isFollowing ? 'Following' : 'Follow'}</Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold">{user.name || 'Anonymous'}</h1>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
          {user.bio && <p className="mt-2 text-sm leading-relaxed">{user.bio}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
            {user.college && <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{user.college}</span>}
            {user.course && <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{user.course}{user.semester && ` · ${user.semester}`}</span>}
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <span><span className="font-bold">{formatNumber(user.postsCount)}</span> <span className="text-muted-foreground">posts</span></span>
            <span><span className="font-bold">{formatNumber(user.followersCount)}</span> <span className="text-muted-foreground">followers</span></span>
            <span><span className="font-bold">{formatNumber(user.followingCount)}</span> <span className="text-muted-foreground">following</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
