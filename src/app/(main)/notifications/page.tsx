import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { NotificationList } from '@/components/notifications/notification-list'

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your latest notifications on PostPencil.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Notifications | PostPencil',
    description: 'View your latest notifications on PostPencil.',
    url: 'https://postpencil.com/notifications',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notifications | PostPencil',
    description: 'View your latest notifications on PostPencil.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function NotificationsPage() {
  return (
    <MainLayout title="Notifications">
      <NotificationList />
    </MainLayout>
  )
}
