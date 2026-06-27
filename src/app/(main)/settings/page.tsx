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
  openGraph: {
    title: 'Settings | PostPencil',
    description: 'Manage your PostPencil account settings, privacy, and notification preferences.',
    url: 'https://postpencil.com/settings',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Settings | PostPencil',
    description: 'Manage your PostPencil account settings and preferences.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function SettingsPage() {
  return (
    <MainLayout title="Settings" showBack>
      <SettingsForm />
    </MainLayout>
  )
}
