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
}

export default function ExplorePage() {
  return (
    <MainLayout title="Explore">
      <ExploreContent />
    </MainLayout>
  )
}
