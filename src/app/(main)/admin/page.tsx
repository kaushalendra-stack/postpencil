import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'PostPencil platform administration dashboard with user and content management.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPage() {
  const session = await auth()
  const userRole = (session?.user as unknown as { role?: string })?.role
  if (!session?.user || userRole !== 'admin') {
    redirect('/home')
  }

  return <AdminDashboard />
}
