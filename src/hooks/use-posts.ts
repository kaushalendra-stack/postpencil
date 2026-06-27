'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface FeedPage {
  data: Array<{ id: string; isLiked?: boolean; isBookmarked?: boolean; likesCount?: number } & Record<string, unknown>>
  hasMore: boolean
  page: number
}

interface FeedData {
  pages: FeedPage[]
}

const POST_CACHE_TIME = 10 * 60 * 1000

export function useFeed(feedType: string = 'latest') {
  return useInfiniteQuery({
    queryKey: ['feed', feedType],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`/api/posts?page=${pageParam}&feed=${feedType}`).then((res) => res.json()),
    getNextPageParam: (lastPage: FeedPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: POST_CACHE_TIME,
    gcTime: 30 * 60 * 1000,
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) =>
      fetch(`/api/posts/${postId}/like`, { method: 'POST' }).then((res) => res.json()),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      queryClient.setQueriesData<FeedData>({ queryKey: ['feed'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post.id === postId
                ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? (post.likesCount ?? 0) - 1 : (post.likesCount ?? 0) + 1 }
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
      queryClient.setQueriesData<FeedData>({ queryKey: ['feed'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
            ),
          })),
        }
      })
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['feed'] }) },
  })
}
