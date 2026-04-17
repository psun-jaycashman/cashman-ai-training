import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { getVideoById } from '@/lib/video-data-api';
import { getChatAttachmentUrl } from '@jazzmind/busibox-app';

const PRESIGN_SECONDS = 3600;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const ids = await ensureDataDocuments(auth.apiToken);
  const video = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (video.source !== 'uploaded' || !video.fileId) {
    return NextResponse.json({ error: 'Not an uploaded video' }, { status: 400 });
  }

  const url = await getChatAttachmentUrl(video.fileId, { accessToken: auth.apiToken }, PRESIGN_SECONDS);
  return NextResponse.json({
    url,
    mimeType: video.mimeType ?? 'video/mp4',
    expiresAt: new Date(Date.now() + PRESIGN_SECONDS * 1000).toISOString(),
  });
}
