import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-border/50 lg:bg-background lg:sticky lg:top-0 lg:h-screen lg:z-30 p-4">
        <Skeleton className="h-12 w-32 mb-8" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
          <Skeleton className="h-6 w-32" />
        </header>
        <main className="flex-1 p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card/50 p-5 animate-pulse">
                <div className="flex gap-4">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
