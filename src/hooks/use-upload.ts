'use client'

import { useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface UseUploadOptions {
  onSuccess?: (data: any) => void
}

export function useUpload({ onSuccess }: UseUploadOptions = {}) {
  const { data: session } = useSession()
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(
    (file: File, postId?: string) => {
      return new Promise<any>((resolve, reject) => {
        const formData = new FormData()
        formData.append('file', file)
        if (postId) formData.append('postId', postId)

        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          setIsUploading(false)
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            toast.success('Upload successful')
            onSuccess?.(data)
            resolve(data)
          } else {
            toast.error('Upload failed')
            reject(new Error('Upload failed'))
          }
        })

        xhr.addEventListener('error', () => {
          setIsUploading(false)
          toast.error('Upload failed')
          reject(new Error('Upload failed'))
        })

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
        setIsUploading(true)
      })
    },
    [onSuccess]
  )

  return { upload, progress, isUploading }
}
