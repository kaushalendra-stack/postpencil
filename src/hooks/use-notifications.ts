'use client'

import { useQuery } from '@tanstack/react-query'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) return { data: [], unreadCount: 0 }
      return res.json()
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
