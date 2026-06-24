'use client'

import Link from 'next/link'
import { GraduationCap, BookOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useFollowUser } from '@/hooks/use-user'
import { formatNumber } from '@/lib/utils'
import type { UserProfile } from '@/lib/types'

interface ProfileHeaderProps {
  user: UserProfile
  isOwnProfile?: boolean
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function ProfileHeader({ user, isOwnProfile = false, isFollowing = false, onFollowChange }: ProfileHeaderProps) {
  const followMutation = useFollowUser()

  const handleFollow = () => {
    followMutation.mutate(user.username, {
      onSuccess: (data) => { onFollowChange?.(data.isFollowing) },
    })
  }

  return (
    <div>
      <div className="h-48 bg-gradient-to-br from-muted to-muted/50 relative" style={user.banner ? { backgroundImage: `url(${user.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />

      <div className="px-4 pb-4">
        <div className="flex justify-between items-end -mt-16 mb-3">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user.image || undefined} alt={user.name || ''} />
            <AvatarFallback className="text-3xl font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 mt-16">
            {isOwnProfile ? (
              <Button variant="outline" className="rounded-full h-9 px-4 text-sm" asChild><Link href="/settings">Edit Profile</Link></Button>
            ) : (
              <Button variant={isFollowing ? 'outline' : 'default'} className="rounded-full h-9 px-5 text-sm" disabled={followMutation.isPending} onClick={handleFollow}>
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
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
