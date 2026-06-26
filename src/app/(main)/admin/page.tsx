import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminPage() {
  return (
    <MainLayout title="Admin" showBack>
      <AdminDashboard />
    </MainLayout>
  )
}
