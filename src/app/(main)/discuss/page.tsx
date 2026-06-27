import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { DiscussionFeed } from '@/components/discuss/discussion-feed'

export const metadata: Metadata = {
  title: 'Discuss',
  description:
    'Join discussions, ask questions, and share ideas with the PostPencil community.',
  alternates: {
    canonical: 'https://postpencil.com/discuss',
  },
}

export default function DiscussPage() {
  return (
    <MainLayout title='Discuss'>
      <DiscussionFeed />
    </MainLayout>
  )
}
