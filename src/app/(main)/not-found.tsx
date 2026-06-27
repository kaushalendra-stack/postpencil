import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mx-auto">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Page not found</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/home">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
