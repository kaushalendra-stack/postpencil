'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, Image as ImageIcon, Presentation, Archive,
  Download, ChevronLeft, ChevronRight, ArrowLeft,
  PanelLeftOpen, PanelLeftClose, Check,
} from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'react-hot-toast'

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  presentation: <Presentation className="h-4 w-4" />,
  zip: <Archive className="h-4 w-4" />,
}

const FILE_COLORS: Record<string, string> = {
  pdf: 'text-rose-500 bg-rose-500/10',
  image: 'text-blue-500 bg-blue-500/10',
  document: 'text-indigo-500 bg-indigo-500/10',
  presentation: 'text-orange-500 bg-orange-500/10',
  zip: 'text-emerald-500 bg-emerald-500/10',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function DocumentViewer() {
  const { postId } = useParams() as { postId: string }
  const searchParams = useSearchParams()
  const router = useRouter()

  const { data: post, isLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetch(`/api/posts/${postId}`).then((r) => r.json()),
    enabled: !!postId,
  })

  const files = post?.files ?? []
  const activeFileId = searchParams.get('file')
  const [activeIndex, setActiveIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadsUsed, setDownloadsUsed] = useState(0)

  useEffect(() => {
    if (!activeFileId || files.length === 0) return
    const idx = files.findIndex((f: { id: string }) => f.id === activeFileId)
    if (idx !== -1) setActiveIndex(idx)
  }, [activeFileId, files])

  const activeFile = files[activeIndex]
  const goFile = useCallback((idx: number) => {
    if (idx < 0 || idx >= files.length) return
    setActiveIndex(idx)
    router.replace(`/view/${postId}?file=${files[idx].id}`, { scroll: false })
  }, [files, postId, router])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goFile(activeIndex - 1)
      if (e.key === 'ArrowRight') goFile(activeIndex + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, goFile])

  const handleDownload = async () => {
    if (!activeFile) return
    setDownloading(true)
    try {
      const recordRes = await fetch(`/api/posts/${postId}/download`, { method: 'POST' })
      const recordData = await recordRes.json()
      if (!recordRes.ok) {
        toast.error(recordData.error || 'Download failed')
        setDownloading(false)
        return
      }
      setDownloadsUsed(recordData.downloadsUsed || downloadsUsed + 1)

      const a = document.createElement('a')
      a.href = `/api/posts/${postId}/download?fileId=${activeFile.id}`
      a.download = ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success(`Downloaded (${recordData.downloadsUsed}/10 today)`, { duration: 3000 })
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex">
        <div className="w-72 border-r border-border/50 p-4 space-y-3 hidden lg:block">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!post || files.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No files to view</p>
          <Link href={`/post/${postId}`} className="text-sm text-primary mt-2 inline-block hover:underline">
            Back to post
          </Link>
        </div>
      </div>
    )
  }

  const isPdf = activeFile?.fileType === 'pdf'
  const isImage = activeFile?.fileType === 'image'

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn(
        'shrink-0 border-r border-border/50 bg-card/50 overflow-hidden flex flex-col transition-all duration-300 ease-out',
        sidebarOpen ? 'w-72' : 'w-0'
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-border/50 shrink-0">
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors shrink-0"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">Files</p>
            <p className="text-sm font-semibold truncate">{post.title}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {files.map((file: { id: string; originalName: string; fileType: string; fileSize: number }, idx: number) => {
            const isActive = file.id === activeFile?.id
            const colors = FILE_COLORS[file.fileType] || 'text-muted-foreground bg-muted/50'
            return (
              <button
                key={file.id}
                onClick={() => goFile(idx)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 group',
                  isActive
                    ? 'bg-primary/10 border border-primary/20 shadow-sm'
                    : 'hover:bg-accent/50 border border-transparent'
                )}
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', colors)}>
                  {FILE_ICONS[file.fileType] || FILE_ICONS.document}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isActive ? 'text-primary' : 'text-foreground')}>
                    {file.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">
                    {file.fileType.toUpperCase()} · {formatFileSize(file.fileSize)}
                  </p>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            )
          })}
        </div>
        <div className="p-3 border-t border-border/50 shrink-0">
          <p className="text-xs text-muted-foreground/40 text-center">
            {files.length} {files.length === 1 ? 'file' : 'files'} · {downloadsUsed}/10 downloads today
          </p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border/50 bg-background/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors shrink-0"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium truncate">{activeFile?.originalName}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground/40 hidden sm:block">
              {activeIndex + 1} / {files.length}
            </span>
            <Button
              onClick={handleDownload}
              disabled={downloading || !activeFile}
              size="sm"
              className="rounded-lg h-8 px-3 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {downloading ? 'Saving...' : 'Download'}
            </Button>
          </div>
        </header>

        {/* Viewer */}
        <main className="flex-1 relative overflow-hidden bg-muted/5">
          {activeIndex > 0 && (
            <button
              onClick={() => goFile(activeIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur border border-border/50 shadow-lg hover:bg-accent transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {activeIndex < files.length - 1 && (
            <button
              onClick={() => goFile(activeIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur border border-border/50 shadow-lg hover:bg-accent transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {isPdf && (
            <iframe
              key={activeFile.id}
              src={`${activeFile.fileUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-fit`}
              className="w-full h-full border-0"
              title={activeFile.originalName}
            />
          )}

          {isImage && (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img
                key={activeFile.id}
                src={activeFile.fileUrl}
                alt={activeFile.originalName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {!isPdf && !isImage && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                {FILE_ICONS[activeFile?.fileType] || FILE_ICONS.document}
              </div>
              <div className="text-center">
                <p className="font-semibold">{activeFile?.originalName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeFile?.fileType.toUpperCase()} · {formatFileSize(activeFile?.fileSize || 0)}
                </p>
              </div>
              <Button onClick={handleDownload} disabled={downloading} className="rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
