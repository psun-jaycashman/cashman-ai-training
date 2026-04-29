import { NextRequest, NextResponse } from 'next/server';
import { bulkSetRecordVisibility } from '@jazzmind/busibox-app';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { listAllVideos } from '@/lib/video-data-api';

export const runtime = 'nodejs';

/**
 * POST /api/admin/training-videos/backfill-visibility
 *
 * Re-stamps every existing training-video record with recordVisibility: 'inherit'
 * so it honors the document's 'authenticated' default instead of the
 * creator-personal default. One-shot fix for rows inserted before the
 * insertVideo() default was changed.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const ids = await ensureDataDocuments(auth.apiToken);
  const videos = await listAllVideos(auth.apiToken, ids.trainingVideos);
  if (videos.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  await bulkSetRecordVisibility(
    auth.apiToken,
    ids.trainingVideos,
    videos.map((v) => v.id),
    'inherit',
  );

  return NextResponse.json({ updated: videos.length });
}
