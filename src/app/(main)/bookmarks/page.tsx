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
}

export default function BookmarksPage() {
  return (
    <MainLayout title="Bookmarks">
      <BookmarkCollections />
    </MainLayout>
  )
}
