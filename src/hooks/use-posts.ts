'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export function useFeed(feedType: string = 'latest') {
  return useInfiniteQuery({
    queryKey: ['feed', feedType],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`/api/posts?page=${pageParam}&feed=${feedType}`).then((res) => res.json()),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) =>
      fetch(`/api/posts/${postId}/like`, { method: 'POST' }).then((res) => res.json()),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) =>
              post.id === postId
                ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 }
                : post
            ),
          })),
        }
      })
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['feed'] }) },
  })
}

export function useBookmarkPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) =>
      fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' }).then((res) => res.json()),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) =>
              post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
            ),
          })),
        }
      })
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['feed'] }) },
  })
}
