import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop() || '';
    const uniqueName = `${randomUUID()}.${ext}`;
    const filePath = join(uploadDir, uniqueName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const mimeType = file.type;
    let fileType: string = 'document';
    if (mimeType.startsWith('image/')) fileType = 'image';
    else if (mimeType === 'application/pdf') fileType = 'pdf';
    else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) fileType = 'presentation';
    else if (mimeType.includes('zip') || mimeType.includes('compressed')) fileType = 'zip';

    const fileId = randomUUID();

    await db.insert(files).values({
      id: fileId,
      postId: '',
      fileName: uniqueName,
      originalName: file.name,
      fileUrl: `/uploads/${uniqueName}`,
      fileSize: file.size,
      mimeType,
      fileType: fileType as 'pdf' | 'image' | 'document' | 'presentation' | 'zip',
    });

    return NextResponse.json({
      id: fileId,
      fileName: uniqueName,
      originalName: file.name,
      fileUrl: `/uploads/${uniqueName}`,
      fileSize: file.size,
      mimeType,
      fileType,
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
