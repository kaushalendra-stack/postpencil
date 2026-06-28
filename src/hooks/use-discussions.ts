'use client'

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

interface DiscussionPage {
  data: Array<{ id: string; isLiked?: boolean; likesCount?: number } & Record<string, unknown>>
  hasMore: boolean
  page: number
}

interface DiscussionData {
  pages: DiscussionPage[]
}

const DISCUSSION_CACHE_TIME = 5 * 60 * 1000

export function useDiscussionFeed(tab: 'for-you' | 'following' = 'for-you') {
  return useInfiniteQuery({
    queryKey: ['discussions', tab],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`/api/discussions?page=${pageParam}&tab=${tab}`).then((res) => res.json()),
    getNextPageParam: (lastPage: DiscussionPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: DISCUSSION_CACHE_TIME,
    gcTime: 15 * 60 * 1000,
  })
}

export function useDiscussion(id: string) {
  return useQuery({
    queryKey: ['discussions', id],
    queryFn: () => fetch(`/api/discussions/${id}`).then((res) => res.json()),
    enabled: !!id,
    staleTime: DISCUSSION_CACHE_TIME,
    gcTime: 15 * 60 * 1000,
  })
}

export function useLikeDiscussion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (discussionId: string) =>
      fetch(`/api/discussions/${discussionId}/like`, { method: 'POST' }).then((res) => res.json()),
    onMutate: async (discussionId) => {
      await queryClient.cancelQueries({ queryKey: ['discussions'] })
      queryClient.setQueriesData<DiscussionData>({ queryKey: ['discussions'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((d) =>
              d.id === discussionId
                ? { ...d, isLiked: !d.isLiked, likesCount: d.isLiked ? (d.likesCount ?? 0) - 1 : (d.likesCount ?? 0) + 1 }
                : d
            ),
          })),
        }
      })
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['discussions'] }) },
  })
}

export function useAddDiscussionReply(discussionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      fetch(`/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', discussionId] })
    },
    onError: () => { toast.error('Failed to post reply') },
  })
}
