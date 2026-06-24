import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <div className="px-4 py-4 border-b border-border/50 animate-pulse">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="h-3.5 w-14 rounded-md" />
            <Skeleton className="h-3.5 w-8 rounded-md" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
          <div className="flex gap-1.5 mt-1">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="h-4 w-12 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
