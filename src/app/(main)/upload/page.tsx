import { MainLayout } from '@/components/layout/main-layout'
import { UploadForm } from '@/components/upload/upload-form'

export default function UploadPage() {
  return (
    <MainLayout title="Upload">
      <UploadForm />
    </MainLayout>
  )
}
