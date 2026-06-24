import { MainLayout } from '@/components/layout/main-layout'
import { HelpContent } from '@/components/help/help-content'

export default function HelpPage() {
  return (
    <MainLayout title="Help" showBack>
      <HelpContent />
    </MainLayout>
  )
}
