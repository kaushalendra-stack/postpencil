import { MainLayout } from '@/components/layout/main-layout'
import { NotificationList } from '@/components/notifications/notification-list'

export default function NotificationsPage() {
  return (
    <MainLayout title="Notifications">
      <NotificationList />
    </MainLayout>
  )
}
