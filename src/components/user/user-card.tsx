'use client'

import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useFollowUser } from '@/hooks/use-user'

interface UserCardProps {
  user: {
    id: string
    name: string | null
    username: string
    image: string | null
    bio: string | null
  }
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function UserCard({ user, isFollowing = false, onFollowChange }: UserCardProps) {
  const followMutation = useFollowUser()

  const handleFollow = () => {
    followMutation.mutate(user.id, {
      onSuccess: (data) => {
        onFollowChange?.(data.isFollowing)
      },
    })
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Link href={`/user/${user.username}`} className="flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || undefined} alt={user.name || ''} />
            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/user/${user.username}`}
            className="font-semibold hover:underline line-clamp-1"
          >
            {user.name || 'Anonymous'}
          </Link>
          <p className="text-sm text-muted-foreground truncate">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        <Button
          variant={isFollowing ? 'outline' : 'default'}
          size="sm"
          className="flex-shrink-0"
          disabled={followMutation.isPending}
          onClick={handleFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </Card>
  )
}
