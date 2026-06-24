'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-lg">
          <div className="mb-10">
            <svg viewBox="0 0 400 320" className="w-full max-w-xs mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background circle */}
              <circle cx="200" cy="155" r="100" className="fill-muted/30" />

              {/* Broken shield / crash icon */}
              <g transform="translate(200, 155)">
                {/* Shield shape */}
                <path
                  d="M0,-80 L70,-50 L70,20 Q70,60 0,90 Q-70,60 -70,20 L-70,-50 Z"
                  className="fill-card stroke-border"
                  strokeWidth="2.5"
                />

                {/* Crack through shield */}
                <path
                  d="M0,-70 L15,-20 L-10,10 L20,50 L0,80"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-destructive/60"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Left broken piece */}
                <path
                  d="M-10,10 L-70,20 L-70,-50 L0,-70 L15,-20 Z"
                  className="fill-destructive/5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />

                {/* Exclamation mark */}
                <text
                  x="40"
                  y="10"
                  textAnchor="middle"
                  className="fill-destructive/50 font-bold"
                  fontSize="36"
                  fontFamily="inherit"
                >
                  !
                </text>
              </g>

              {/* Floating particles */}
              <circle cx="80" cy="100" r="4" className="fill-destructive/15" />
              <circle cx="320" cy="110" r="3" className="fill-destructive/10" />
              <circle cx="90" cy="210" r="3" className="fill-destructive/10" />
              <circle cx="310" cy="200" r="5" className="fill-destructive/8" />
              <circle cx="120" cy="70" r="2" className="fill-destructive/12" />
              <circle cx="280" cy="80" r="3" className="fill-destructive/10" />

              {/* Small debris */}
              <rect x="75" y="150" width="5" height="5" rx="1" className="fill-muted-foreground/10" transform="rotate(30 77 152)" />
              <rect x="318" y="145" width="4" height="4" rx="1" className="fill-muted-foreground/8" transform="rotate(-20 320 147)" />
              <rect x="100" y="230" width="4" height="4" rx="1" className="fill-muted-foreground/8" transform="rotate(45 102 232)" />
              <rect x="295" y="225" width="5" height="5" rx="1" className="fill-muted-foreground/10" transform="rotate(15 297 227)" />

              {/* Bottom label */}
              <rect x="155" y="270" width="90" height="24" rx="12" className="fill-destructive/10" />
              <text x="200" y="286" textAnchor="middle" className="fill-destructive/50 font-medium" fontSize="11" fontFamily="inherit">
                CRITICAL ERROR
              </text>
            </svg>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-3">Critical error</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
            A critical error occurred that prevented the application from loading properly. Please try refreshing the page.
          </p>

          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="outline" className="rounded-xl px-6">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/home">
              <Button className="rounded-xl px-6">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
