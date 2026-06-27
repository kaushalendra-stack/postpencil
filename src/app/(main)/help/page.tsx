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
  openGraph: {
    title: 'Help Center | PostPencil',
    description:
      'Get help with your PostPencil account, find answers to FAQs, or submit a support ticket.',
    url: 'https://postpencil.com/help',
    siteName: 'PostPencil',
    images: [{ url: 'https://postpencil.com/og.png', width: 1200, height: 630, alt: 'PostPencil' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | PostPencil',
    description: 'Get help with your PostPencil account and find FAQs.',
    images: ['https://postpencil.com/og.png'],
  },
}

export default function HelpPage() {
  return (
    <MainLayout title="Help" showBack>
      <HelpContent />
    </MainLayout>
  )
}
