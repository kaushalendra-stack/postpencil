import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { ExploreContent } from '@/components/search/explore-content'

export const metadata: Metadata = {
  title: 'Explore',
  description:
    'Explore trending educational resources, popular tags, and top categories on PostPencil. Find notes, PDFs, and study materials.',
  alternates: {
    canonical: 'https://postpencil.com/explore',
  },
  openGraph: {
    title: 'Explore | PostPencil',
    description:
      'Explore trending educational resources, popular tags, and top categories on PostPencil.',
    url: 'https://postpencil.com/explore',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore | PostPencil',
    description: 'Explore trending educational resources and popular tags.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function ExplorePage() {
  return (
    <MainLayout title="Explore">
      <ExploreContent />
    </MainLayout>
  )
}
