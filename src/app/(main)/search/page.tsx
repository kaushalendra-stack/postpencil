import { MainLayout } from '@/components/layout/main-layout'
import { SearchResults } from '@/components/search/search-results'

export default function SearchPage() {
  return (
    <MainLayout title="Search">
      <SearchResults />
    </MainLayout>
  )
}
