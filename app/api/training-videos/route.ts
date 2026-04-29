import { NextRequest, NextResponse } from 'next/server';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { listVideosForModule, listVideosForLesson } from '@/lib/video-data-api';
import { getChatAttachmentUrl } from '@jazzmind/busibox-app';
import type { TrainingVideo, TrainingVideoWithPlayback } from '@/lib/types';

const PRESIGN_SECONDS = 3600;

export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get('moduleId');
  const lessonId = searchParams.get('lessonId');
  if (!moduleId) return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });

  const ids = await ensureDataDocuments(auth.apiToken);
  const videos: TrainingVideo[] = lessonId
    ? await listVideosForLesson(auth.apiToken, ids.trainingVideos, moduleId, lessonId)
    : await listVideosForModule(auth.apiToken, ids.trainingVideos, moduleId);

  const resolved: TrainingVideoWithPlayback[] = await Promise.all(videos.map(async (v) => {
    if (v.source === 'uploaded') {
      if (!v.fileId) {
        console.error('[training-videos] uploaded record missing fileId', v.id);
        return { ...v, playback: null };
      }
      try {
        const url = await getChatAttachmentUrl(v.fileId, { accessToken: auth.apiToken }, PRESIGN_SECONDS);
        return {
          ...v,
          playback: {
            kind: 'uploaded',
            url,
            mimeType: v.mimeType ?? 'video/mp4',
            expiresAt: new Date(Date.now() + PRESIGN_SECONDS * 1000).toISOString(),
          },
        };
      } catch (err) {
        // File is not accessible to this user (e.g. another user's MinIO
        // upload). Surface the record without a playback URL so the rest
        // of the page still renders.
        console.warn(
          '[training-videos] presigned URL failed for video',
          v.id,
          'fileId',
          v.fileId,
          'as user',
          auth.userId,
          err instanceof Error ? err.message : err,
        );
        return { ...v, playback: null };
      }
    }
    return {
      ...v,
      playback: {
        kind: 'external',
        provider: v.externalProvider ?? 'other',
        url: v.externalUrl!,
      },
    };
  }));

  return NextResponse.json({ videos: resolved });
}
