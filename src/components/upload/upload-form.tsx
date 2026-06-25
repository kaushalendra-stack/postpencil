'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Upload,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  X,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUpload } from '@/hooks/use-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

function TagChip({ tag, onRemove, onEdit }: { tag: string; onRemove: () => void; onEdit: (newTag: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(tag)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    setEditing(true)
    setEditValue(tag)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleBlur = () => {
    setEditing(false)
    onEdit(editValue)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); handleBlur() }
          if (e.key === 'Escape') { setEditing(false); setEditValue(tag) }
        }}
        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/30 outline-none min-w-[60px]"
      />
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
      onClick={handleClick}
    >
      {tag}
      <button onClick={(e) => { e.stopPropagation(); onRemove() }} className="rounded-full p-0.5 hover:bg-primary/20">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (['pdf'].includes(ext ?? '')) return <FileText className="h-8 w-8 text-red-500" />
  if (['doc', 'docx'].includes(ext ?? '')) return <FileText className="h-8 w-8 text-blue-500" />
  if (['xls', 'xlsx', 'csv'].includes(ext ?? '')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) return <FileImage className="h-8 w-8 text-purple-500" />
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext ?? '')) return <FileVideo className="h-8 w-8 text-orange-500" />
  return <File className="h-8 w-8 text-muted-foreground" />
}

export function UploadForm() {
  const router = useRouter()
  const { upload, progress, isUploading } = useUpload({
    onSuccess: () => {
      toast.success('Resource published!')
      router.push('/')
    },
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [course, setCourse] = useState('')
  const [semester, setSemester] = useState('')
  const [college, setCollege] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
    },
  })

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    // Step 1: Create the post first
    const postRes = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, subject, course, semester, college, tags }),
    })

    if (!postRes.ok) {
      toast.error('Failed to create post')
      return
    }

    const postData = await postRes.json()
    const postId = postData.id

    // Step 2: Upload files with postId
    for (const file of selectedFiles) {
      await upload(file, postId)
    }

    toast.success('Resource published!')
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold tracking-tight">Upload Resource</h1>

      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          {isDragActive ? 'Drop your files here' : 'Drag & drop files or click to browse'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          PDF, DOC, XLS, Images, Videos (max 50MB)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              {getFileIcon(file.name)}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Uploading... {progress}%
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures Notes - Unit 1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your resource..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. B.Tech"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. 3rd"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Input
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. MIT"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => {
                const val = e.target.value
                if (val.includes(',') || val.includes('，')) {
                  const parts = val.split(/[,，]/)
                  parts.forEach((part) => {
                    const trimmed = part.trim()
                    if (trimmed && !tags.includes(trimmed)) {
                      setTags((prev) => [...prev, trimmed])
                    }
                  })
                  setTagInput('')
                } else {
                  setTagInput(val)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addTag() }
                if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                  setTags((prev) => prev.slice(0, -1))
                }
              }}
              placeholder="Type a tag and press comma"
            />
            <Button type="button" variant="outline" size="icon" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  onEdit={(newTag) => {
                    if (newTag.trim() && newTag.trim() !== tag) {
                      setTags((prev) => prev.map((t, i) => i === index ? newTag.trim() : t))
                    } else if (!newTag.trim()) {
                      setTags((prev) => prev.filter((_, i) => i !== index))
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handlePublish}
        disabled={isUploading || !title.trim() || selectedFiles.length === 0}
      >
        {isUploading ? 'Publishing...' : 'Publish Resource'}
      </Button>
    </div>
  )
}
