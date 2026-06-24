'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useSessionHeartbeat() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'authenticated') return

    const checkSession = async () => {
      try {
        const res = await fetch('/api/sessions', { method: 'POST' })
        if (!res.ok) {
          router.push('/login')
        }
      } catch {
        // Network error — don't redirect, just skip
      }
    }

    // Check immediately on mount
    checkSession()

    // Then every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [status, router])
}
