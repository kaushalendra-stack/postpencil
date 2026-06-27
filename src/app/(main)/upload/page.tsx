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
  openGraph: {
    title: 'Upload | PostPencil',
    description: 'Upload educational resources to share with the PostPencil community.',
    url: 'https://postpencil.com/upload',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upload | PostPencil',
    description: 'Upload educational resources to share with the community.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function UploadPage() {
  return (
    <MainLayout title="Upload">
      <UploadForm />
    </MainLayout>
  )
}
