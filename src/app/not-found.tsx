import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg">
        <div className="mb-10">
          <svg viewBox="0 0 400 320" className="w-full max-w-xs mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Desk */}
            <rect x="60" y="240" width="280" height="8" rx="4" className="fill-muted" />

            {/* Monitor stand */}
            <rect x="180" y="220" width="40" height="28" rx="2" className="fill-muted-foreground/20" />
            <rect x="160" y="240" width="80" height="6" rx="3" className="fill-muted-foreground/20" />

            {/* Monitor */}
            <rect x="100" y="100" width="200" height="128" rx="12" className="fill-card stroke-border" strokeWidth="2" />

            {/* Screen */}
            <rect x="112" y="112" width="176" height="100" rx="6" className="fill-muted/50" />

            {/* 404 on screen */}
            <text x="200" y="172" textAnchor="middle" className="fill-muted-foreground font-bold" fontSize="48" fontFamily="inherit">
              404
            </text>

            {/* Sad face on screen */}
            <circle cx="170" cy="145" r="3" className="fill-muted-foreground/40" />
            <circle cx="230" cy="145" r="3" className="fill-muted-foreground/40" />
            <path d="M175 195 Q200 180 225 195" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" fill="none" strokeLinecap="round" />

            {/* Pencil floating away - left side */}
            <g transform="translate(50, 80) rotate(-25)">
              <rect x="0" y="0" width="8" height="60" rx="1" className="fill-primary/30" />
              <polygon points="0,60 8,60 4,72" className="fill-primary/40" />
              <rect x="0" y="0" width="8" height="10" rx="1" className="fill-primary/50" />
            </g>

            {/* Paper floating - right side */}
            <g transform="translate(300, 60) rotate(15)">
              <rect x="0" y="0" width="40" height="52" rx="3" className="fill-card stroke-border" strokeWidth="1.5" />
              <line x1="8" y1="14" x2="32" y2="14" className="stroke-muted-foreground/30" strokeWidth="1.5" />
              <line x1="8" y1="22" x2="28" y2="22" className="stroke-muted-foreground/30" strokeWidth="1.5" />
              <line x1="8" y1="30" x2="24" y2="30" className="stroke-muted-foreground/30" strokeWidth="1.5" />
              <line x1="8" y1="38" x2="20" y2="38" className="stroke-muted-foreground/30" strokeWidth="1.5" />
            </g>

            {/* Small floating dots */}
            <circle cx="80" cy="140" r="4" className="fill-primary/20" />
            <circle cx="320" cy="120" r="3" className="fill-primary/15" />
            <circle cx="340" cy="180" r="5" className="fill-primary/10" />
            <circle cx="60" cy="200" r="3" className="fill-primary/15" />

            {/* Question marks floating */}
            <text x="90" y="180" className="fill-muted-foreground/20" fontSize="24" fontFamily="inherit">?</text>
            <text x="310" y="160" className="fill-muted-foreground/20" fontSize="18" fontFamily="inherit">?</text>
            <text x="330" y="220" className="fill-muted-foreground/15" fontSize="16" fontFamily="inherit">?</text>
          </svg>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
        </p>

        <Link href="/home">
          <Button className="rounded-xl px-6">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
