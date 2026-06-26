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
}

export default function SearchPage() {
  return (
    <MainLayout title="Search">
      <SearchResults />
    </MainLayout>
  )
}
