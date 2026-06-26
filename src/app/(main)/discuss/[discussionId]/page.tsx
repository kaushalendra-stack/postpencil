'use client'

import { useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { DiscussionDetail } from '@/components/discuss/discussion-detail'

export default function DiscussionDetailPage() {
  const { discussionId } = useParams() as { discussionId: string }
  return (
    <MainLayout showBack>
      <DiscussionDetail discussionId={discussionId} />
    </MainLayout>
  )
}
