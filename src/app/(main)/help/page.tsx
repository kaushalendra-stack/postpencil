import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { HelpContent } from '@/components/help/help-content'

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Get help with your PostPencil account, find answers to frequently asked questions, or submit a support ticket.',
  alternates: {
    canonical: 'https://postpencil.com/help',
  },
}

export default function HelpPage() {
  return (
    <MainLayout title="Help" showBack>
      <HelpContent />
    </MainLayout>
  )
}
