import { MainLayout } from '@/components/layout/main-layout'
import { DiscussionFeed } from '@/components/discuss/discussion-feed'

export default function DiscussPage() {
  return (
    <MainLayout title='Discuss'>
      <DiscussionFeed />
    </MainLayout>
  )
}
