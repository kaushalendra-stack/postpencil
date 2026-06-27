'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin page error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mx-auto">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Admin panel error</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {error.message || 'An unexpected error occurred while loading this admin page.'}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset} className="rounded-xl">
            Try again
          </Button>
          <Button onClick={() => window.location.href = '/admin'} variant="outline" className="rounded-xl">
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
