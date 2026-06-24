import { MainLayout } from '@/components/layout/main-layout'
import { PostDetail } from '@/components/post/post-detail'

export default function PostPage() {
  return (
    <MainLayout showBack>
      <PostDetail />
    </MainLayout>
  )
}
