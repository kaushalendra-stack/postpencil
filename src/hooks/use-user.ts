'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export function useFollowUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      fetch(`/api/users/${userId}/follow`, { method: 'POST' }).then((res) =>
        res.json()
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error('Failed to follow user')
    },
  })
}

export function useUser(username: string) {
  return useQuery({
    queryKey: ['users', username],
    queryFn: () =>
      fetch(`/api/users/${username}`).then((res) => res.json()),
    enabled: !!username,
  })
}

export function useUserPosts(username: string) {
  return useQuery({
    queryKey: ['users', username, 'posts'],
    queryFn: () =>
      fetch(`/api/users/${username}/posts`).then((res) => res.json()),
    enabled: !!username,
  })
}
