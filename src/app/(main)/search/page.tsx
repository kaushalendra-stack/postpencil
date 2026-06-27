import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { SearchResults } from '@/components/search/search-results'

export const metadata: Metadata = {
  title: 'Search',
  description:
    'Search for educational resources, notes, PDFs, and study materials on PostPencil.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Search | PostPencil',
    description: 'Search for educational resources on PostPencil.',
    url: 'https://postpencil.com/search',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search | PostPencil',
    description: 'Search for educational resources on PostPencil.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function SearchPage() {
  return (
    <MainLayout title="Search">
      <SearchResults />
    </MainLayout>
  )
}
