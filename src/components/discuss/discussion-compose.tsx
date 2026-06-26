'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ImagePlus, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useUpload } from '@/hooks/use-upload'

export function DiscussionCompose() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { upload } = useUpload()

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

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      let imageUrl: string | null = null

      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), imageUrl }),
      })

      if (!res.ok) throw new Error('Failed to create')
      const data = await res.json()

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('discussionId', data.id)
        await fetch('/api/upload-discussion-image', { method: 'POST', body: formData }).catch(() => {})
      }

      setContent('')
      setImageFile(null)
      setImagePreview(null)
      setIsFocused(false)
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      toast.success('Posted!')
    } catch {
      toast.error('Failed to post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-300 overflow-hidden mb-4',
      isFocused
        ? 'border-primary/30 bg-card shadow-lg shadow-primary/5'
        : 'border-border/40 bg-card/50 hover:border-border/60'
    )}>
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
              {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              rows={isFocused ? 3 : 1}
              className={cn(
                'w-full resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 transition-all duration-200 px-3 py-2.5',
                isFocused ? 'min-h-[80px]' : 'min-h-[40px]'
              )}
            />
          </div>
        </div>

        {imagePreview && (
          <div className="mt-3 ml-12 relative inline-block">
            <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 object-cover border border-border/30" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className={cn(
        'flex items-center justify-between px-4 py-3 border-t border-border/30 bg-muted/20 transition-all duration-300',
        isFocused ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden py-0 border-t-0'
      )}>
        <div className="flex items-center gap-1">
          <label className="p-2 rounded-lg text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/50 transition-colors cursor-pointer">
            <ImagePlus className="h-4 w-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/40 tabular-nums">{content.length}/500</span>
          <button
            onClick={() => { setContent(''); setIsFocused(false); removeImage() }}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || content.length > 500}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
              content.trim() && content.length <= 500
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
