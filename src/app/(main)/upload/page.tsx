import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { UploadForm } from '@/components/upload/upload-form'

export const metadata: Metadata = {
  title: 'Upload',
  description:
    'Upload educational resources, notes, PDFs, presentations, and study materials to share with the PostPencil community.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function UploadPage() {
  return (
    <MainLayout title="Upload">
      <UploadForm />
    </MainLayout>
  )
}
