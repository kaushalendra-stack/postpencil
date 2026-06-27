import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { BookmarkCollections } from '@/components/bookmarks/bookmark-collections'

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Access your saved educational resources and bookmarked posts on PostPencil.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Bookmarks | PostPencil',
    description: 'Access your saved educational resources and bookmarked posts.',
    url: 'https://postpencil.com/bookmarks',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookmarks | PostPencil',
    description: 'Access your saved educational resources and bookmarked posts.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function BookmarksPage() {
  return (
    <MainLayout title="Bookmarks">
      <BookmarkCollections />
    </MainLayout>
  )
}
