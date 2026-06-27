'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const USER_CACHE_TIME = 10 * 60 * 1000

export function useFollowUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      fetch(`/api/users/${userId}/follow`, { method: 'POST' }).then((res) =>
        res.json()
      ),
    onMutate: async (_userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] })
    },
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
    staleTime: USER_CACHE_TIME,
    gcTime: 20 * 60 * 1000,
  })
}

export function useUserPosts(username: string) {
  return useQuery({
    queryKey: ['users', username, 'posts'],
    queryFn: () =>
      fetch(`/api/users/${username}/posts`).then((res) => res.json()),
    enabled: !!username,
    staleTime: USER_CACHE_TIME,
    gcTime: 20 * 60 * 1000,
  })
}
