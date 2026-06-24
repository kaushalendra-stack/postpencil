'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LegalLayoutProps {
  title: string
  description: string
  lastUpdated: string
  sections: { id: string; title: string }[]
  children: React.ReactNode
  className?: string
}

export function LegalLayout({
  title,
  description,
  lastUpdated,
  sections,
  children,
  className,
}: LegalLayoutProps) {
  const router = useRouter()

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-12">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 font-medium">
              Last updated: {lastUpdated}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
          <nav className="hidden lg:block">
            <div className="sticky top-8 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="min-w-0 space-y-10">
            {children}
          </div>
        </div>

        <div className="mt-16 border-t border-border/50 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Questions? Contact us at{' '}
            <a href="mailto:legal@postpencil.com" className="text-foreground hover:underline">
              legal@postpencil.com
            </a>
          </p>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            postpencil.com
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-lg font-semibold tracking-tight mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>
}

export { Section, List, Highlight }
