import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { ModernFeed } from '@/components/feed/modern-feed'
import { websiteJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover and share educational resources on PostPencil. Browse trending notes, PDFs, presentations, and study materials from students across India.',
  alternates: {
    canonical: 'https://postpencil.com/home',
  },
  openGraph: {
    title: 'Home | PostPencil',
    description:
      'Discover and share educational resources on PostPencil. Browse trending notes, PDFs, presentations, and study materials.',
    url: 'https://postpencil.com/home',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home | PostPencil',
    description: 'Discover and share educational resources on PostPencil.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      <MainLayout title='Home'>
        <ModernFeed />
      </MainLayout>
    </>
  )
}
