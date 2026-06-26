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
}

export default function NotificationsPage() {
  return (
    <MainLayout title="Notifications">
      <NotificationList />
    </MainLayout>
  )
}
