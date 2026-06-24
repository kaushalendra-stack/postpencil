import { MainLayout } from '@/components/layout/main-layout'
import { BookmarkCollections } from '@/components/bookmarks/bookmark-collections'

export default function BookmarksPage() {
  return (
    <MainLayout title="Bookmarks">
      <BookmarkCollections />
    </MainLayout>
  )
}
