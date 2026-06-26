import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { SettingsForm } from '@/components/settings/settings-form'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your PostPencil account settings, privacy, and notification preferences.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function SettingsPage() {
  return (
    <MainLayout title="Settings" showBack>
      <SettingsForm />
    </MainLayout>
  )
}
