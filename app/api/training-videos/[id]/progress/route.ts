import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { getVideoProgress, upsertVideoProgress, getVideoById } from '@/lib/video-data-api';

const putSchema = z.object({
  positionSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
});

interface Ctx { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const ids = await ensureDataDocuments(auth.apiToken);
  const progress = await getVideoProgress(auth.apiToken, ids.trainingVideoProgress, auth.userId, id);
  return NextResponse.json({ progress });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const ids = await ensureDataDocuments(auth.apiToken);
  const video = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  const progress = await upsertVideoProgress(auth.apiToken, ids.trainingVideoProgress, {
    visitorId: auth.userId,
    videoId: id,
    moduleId: video.moduleId,
    lessonId: video.lessonId,
    positionSeconds: parsed.data.positionSeconds,
    durationSeconds: parsed.data.durationSeconds,
  });
  return NextResponse.json({ progress });
}
