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
  openGraph: {
    title: 'Discuss | PostPencil',
    description:
      'Join discussions, ask questions, and share ideas with the PostPencil community.',
    url: 'https://postpencil.com/discuss',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discuss | PostPencil',
    description: 'Join discussions and share ideas with the community.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function DiscussPage() {
  return (
    <MainLayout title='Discuss'>
      <DiscussionFeed />
    </MainLayout>
  )
}
