'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ImagePlus, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export function DiscussionCompose() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  if (!session?.user) return null

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const reset = () => {
    setContent('')
    setImageFile(null)
    setImagePreview(null)
    setExpanded(false)
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), imageUrl: null }),
      })
      if (!res.ok) throw new Error('Failed to create')
      const data = await res.json()
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('discussionId', data.id)
        await fetch('/api/upload-discussion-image', { method: 'POST', body: formData }).catch(() => {})
      }
      reset()
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
    } catch {
      toast.error('Failed to post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn(
      'relative rounded-2xl border transition-all duration-400',
      expanded
        ? 'border-border/50 bg-card shadow-lg shadow-black/[0.03] dark:shadow-black/15'
        : 'border-border/25 bg-card/80 hover:bg-card hover:border-border/40 hover:shadow-md hover:shadow-black/[0.02]'
    )}>
      {/* Gradient accent when focused */}
      {expanded && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      )}

      <div className="flex gap-3.5 p-5">
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-border/15">
          <AvatarImage src={session.user.image || undefined} />
          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-muted to-muted/60">
            {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <textarea
            placeholder="Share something interesting..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (!expanded && e.target.value.length > 0) setExpanded(true)
            }}
            onFocus={() => setExpanded(true)}
            className="w-full resize-none border-0 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/35 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 leading-relaxed"
            rows={expanded ? 3 : 1}
            style={{ minHeight: expanded ? 76 : 28 }}
          />

          {imagePreview && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-border/20 inline-block animate-in fade-in slide-in-from-bottom-1 duration-300">
              <img src={imagePreview} alt="Preview" className="max-h-48 object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className={cn(
            'flex items-center justify-between overflow-hidden transition-all duration-300 ease-out',
            expanded ? 'mt-4 pt-4 border-t border-border/15 opacity-100 max-h-24' : 'mt-0 pt-0 border-t-0 opacity-0 max-h-0'
          )}>
            <div className="flex items-center gap-0.5 -ml-1.5">
              <label className="p-2 rounded-full text-muted-foreground/25 hover:text-blue-500 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer">
                <ImagePlus className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className={cn(
                  'text-[11px] tabular-nums font-mono transition-colors',
                  content.length > 500 ? 'text-red-500' : content.length > 400 ? 'text-amber-500' : 'text-muted-foreground/25'
                )}>
                  {content.length}
                </span>
              )}
              {expanded && content.length === 0 && (
                <button onClick={reset} className="text-xs text-muted-foreground/35 hover:text-foreground transition-colors">
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting || content.length > 500}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300',
                  content.trim() && content.length <= 500
                    ? 'bg-foreground text-background hover:opacity-90 hover:shadow-md hover:shadow-primary/10 hover:scale-[1.03] active:scale-[0.97]'
                    : 'bg-muted text-muted-foreground/25 cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
