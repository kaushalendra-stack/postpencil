import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { ModernFeed } from '@/components/feed/modern-feed'
import { websiteJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover and share educational resources on PostPencil. Browse trending notes, PDFs, presentations, and study materials from students across India.',
  alternates: {
    canonical: 'https://postpencil.com/home',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      <MainLayout title='Home'>
        <ModernFeed />
      </MainLayout>
    </>
  )
}
