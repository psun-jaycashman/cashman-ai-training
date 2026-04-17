import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { updateVideo, deleteVideo, getVideoById } from '@/lib/video-data-api';

interface Ctx { params: Promise<{ id: string }> }

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  moduleId: z.string().min(1).optional(),
  lessonId: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  posterUrl: z.string().url().optional(),
  durationSeconds: z.number().nonnegative().optional(),
}).strict();

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const ids = await ensureDataDocuments(auth.apiToken);
  const existing = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await updateVideo(auth.apiToken, ids.trainingVideos, id, parsed.data);
  return NextResponse.json({ ...existing, ...parsed.data });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const ids = await ensureDataDocuments(auth.apiToken);
  const existing = await getVideoById(auth.apiToken, ids.trainingVideos, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await deleteVideo(auth.apiToken, ids.trainingVideos, id);
  return new NextResponse(null, { status: 204 });
}
