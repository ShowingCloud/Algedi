import { NextRequest, NextResponse } from 'next/server';
import { uploadAsset } from '@repo/ai-editor/actions';
import Redis from 'ioredis';

/**
 * API Route Handler for asset upload
 * In production, this would generate presigned URLs for direct S3/R2 upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;

    if (!file || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, organizationId' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Generate presigned URL for S3/R2
    // 2. Return URL to client for direct upload
    // 3. Client uploads directly to storage
    // 4. Client calls this endpoint with the final URL
    
    // For now, we'll simulate by storing file metadata
    // In production, implement actual file storage (S3, R2, etc.)
    const fileUrl = `/uploads/${organizationId}/${file.name}`; // Placeholder URL
    
    // Get Redis connection
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const connection = new Redis(redisUrl);

    const result = await uploadAsset({
      organizationId,
      url: fileUrl,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      queueConnection: { connection } as any,
      autoDescribe: true,
    });

    await connection.quit();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

