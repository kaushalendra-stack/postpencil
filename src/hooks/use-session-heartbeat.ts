'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useSessionHeartbeat(intervalMs: number = 5 * 60 * 1000) {
  const { status } = useSession()

  useEffect(() => {
    if (status !== 'authenticated') return

    const heartbeat = async () => {
      try {
        await fetch('/api/sessions', { method: 'PATCH' })
      } catch {}
    }

    heartbeat()
    const interval = setInterval(heartbeat, intervalMs)

    return () => clearInterval(interval)
  }, [status, intervalMs])
}
