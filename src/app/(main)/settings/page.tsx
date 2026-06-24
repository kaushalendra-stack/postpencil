import { MainLayout } from '@/components/layout/main-layout'
import { SettingsForm } from '@/components/settings/settings-form'

export default function SettingsPage() {
  return (
    <MainLayout title="Settings" showBack>
      <SettingsForm />
    </MainLayout>
  )
}
