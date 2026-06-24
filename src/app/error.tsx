'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg">
        <div className="mb-10">
          <svg viewBox="0 0 400 320" className="w-full max-w-xs mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Base platform */}
            <ellipse cx="200" cy="270" rx="140" ry="12" className="fill-muted/50" />

            {/* Broken server/device box */}
            <rect x="120" y="140" width="160" height="120" rx="12" className="fill-card stroke-border" strokeWidth="2" />

            {/* Crack line on device */}
            <path d="M180 140 L195 180 L175 200 L200 260" stroke="currentColor" strokeWidth="2.5" className="text-destructive/60" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M220 140 L205 175 L225 195 L210 260" stroke="currentColor" strokeWidth="2" className="text-destructive/40" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Warning icon inside */}
            <g transform="translate(175, 165)">
              <polygon points="25,0 50,45 0,45" className="fill-destructive/10 stroke-destructive/40" strokeWidth="1.5" strokeLinejoin="round" />
              <text x="25" y="35" textAnchor="middle" className="fill-destructive/60 font-bold" fontSize="20" fontFamily="inherit">!</text>
            </g>

            {/* Disconnected cable left */}
            <path d="M120 200 Q90 200 80 180 Q70 160 60 160" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" fill="none" strokeLinecap="round" />
            <circle cx="58" cy="160" r="4" className="fill-muted-foreground/20" />

            {/* Disconnected cable right */}
            <path d="M280 200 Q310 200 320 180 Q330 160 340 160" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" fill="none" strokeLinecap="round" />
            <circle cx="342" cy="160" r="4" className="fill-muted-foreground/20" />

            {/* Sparks / error indicators */}
            <g className="text-destructive/40">
              <line x1="100" y1="130" x2="108" y2="122" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="108" y1="130" x2="100" y2="122" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="text-destructive/30">
              <line x1="300" y1="140" x2="308" y2="132" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="308" y1="140" x2="300" y2="132" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="text-destructive/25">
              <line x1="140" y1="110" x2="146" y2="104" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="146" y1="110" x2="140" y2="104" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Small floating fragments */}
            <rect x="105" y="150" width="6" height="6" rx="1" className="fill-muted-foreground/10" transform="rotate(20 108 153)" />
            <rect x="290" y="145" width="5" height="5" rx="1" className="fill-muted-foreground/10" transform="rotate(-15 292 147)" />
            <rect x="155" y="105" width="4" height="4" rx="1" className="fill-muted-foreground/8" transform="rotate(35 157 107)" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          An unexpected error occurred while processing your request. Please try again or return to the home page.
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
    </div>
  )
}
