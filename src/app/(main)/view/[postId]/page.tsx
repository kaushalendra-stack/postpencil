import { Metadata } from 'next'
import { DocumentViewer } from '@/components/post/document-viewer'

export const metadata: Metadata = {
  title: 'Document Viewer',
  robots: { index: false, follow: true },
}

export default function ViewPage() {
  return <DocumentViewer />
}
