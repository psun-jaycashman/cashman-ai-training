import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { insertVideo, listAllVideos } from '@/lib/video-data-api';
import { detectProvider } from '@/lib/video-embed';

export const runtime = 'nodejs';
export const maxDuration = 600;

const externalBodySchema = z.object({
  source: z.literal('external'),
  externalUrl: z.string().url(),
  moduleId: z.string().min(1),
  lessonId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.startsWith('multipart/form-data')) {
    // Implemented in Task B below
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  }

  if (contentType.startsWith('application/json')) {
    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = externalBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    let provider: 'youtube' | 'vimeo' | 'other';
    try { provider = detectProvider(parsed.data.externalUrl); } catch (err) {
      return NextResponse.json({ error: 'Invalid external URL', message: String(err) }, { status: 400 });
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const video = await insertVideo(auth.apiToken, ids.trainingVideos, {
      moduleId: parsed.data.moduleId,
      lessonId: parsed.data.lessonId,
      title: parsed.data.title,
      description: parsed.data.description,
      source: 'external',
      externalUrl: parsed.data.externalUrl,
      externalProvider: provider,
      order: parsed.data.order ?? 0,
      uploadedBy: auth.userId,
    });
    return NextResponse.json(video, { status: 201 });
  }

  return NextResponse.json({ error: 'Unsupported content-type' }, { status: 415 });
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const ids = await ensureDataDocuments(auth.apiToken);
  const videos = await listAllVideos(auth.apiToken, ids.trainingVideos, {
    moduleId: searchParams.get('moduleId') ?? undefined,
    lessonId: searchParams.get('lessonId') ?? undefined,
  });
  return NextResponse.json({ videos });
}
