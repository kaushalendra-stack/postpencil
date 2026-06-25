import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

const PHP_UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'https://postpencil.protoolvault.in';
const UPLOAD_API_KEY = process.env.UPLOAD_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postId = formData.get('postId') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Upload to PHP server
    const phpFormData = new FormData();
    phpFormData.append('file', file);
    phpFormData.append('api_key', UPLOAD_API_KEY);

    const res = await fetch(`${PHP_UPLOAD_URL}/upload.php`, {
      method: 'POST',
      body: phpFormData,
      signal: AbortSignal.timeout(120000),
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json({ error: data.error || 'Upload failed' }, { status: 500 });
    }

    // Determine file type
    const mimeType = file.type;
    let fileType: string = 'document';
    if (mimeType.startsWith('image/')) fileType = 'image';
    else if (mimeType === 'application/pdf') fileType = 'pdf';
    else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) fileType = 'presentation';
    else if (mimeType.includes('zip') || mimeType.includes('compressed')) fileType = 'zip';

    // Save file record to DB
    const fileId = randomUUID();
    await db.insert(files).values({
      id: fileId,
      postId: postId || null,
      fileName: data.file_name || '',
      originalName: file.name,
      fileUrl: data.file_url || '',
      fileSize: file.size,
      mimeType,
      fileType: fileType as any,
    });

    return NextResponse.json({
      id: fileId,
      fileName: data.file_name || '',
      originalName: file.name,
      fileUrl: data.file_url || '',
      fileSize: file.size,
      mimeType,
      fileType,
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
