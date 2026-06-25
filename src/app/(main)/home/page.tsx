import { MainLayout } from '@/components/layout/main-layout'
import { FeedTabs } from '@/components/feed/feed-tabs'

export default function HomePage() {
  return (
    <MainLayout title='Home'>
      <FeedTabs />
    </MainLayout>
  )
}
