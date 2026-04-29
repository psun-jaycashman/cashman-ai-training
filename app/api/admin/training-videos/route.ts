import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { insertVideo, listAllVideos, uploadVideoToLibrary } from '@/lib/video-data-api';
import { detectProvider } from '@/lib/video-embed';

export const runtime = 'nodejs';
export const maxDuration = 600;

// Upload may run as long as the route's maxDuration. data-api client's
// default fetch timeout is 30s — way too short for multi-MB videos.
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

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
    let formData: FormData;
    try { formData = await request.formData(); } catch {
      return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 });
    }

    const file = formData.get('file');
    const moduleId = formData.get('moduleId');
    const title = formData.get('title');
    if (!(file instanceof File) || typeof moduleId !== 'string' || !moduleId || typeof title !== 'string' || !title) {
      return NextResponse.json({ error: 'Missing required fields: file, moduleId, title' }, { status: 400 });
    }
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video/*' }, { status: 400 });
    }

    const lessonId = formData.get('lessonId');
    const description = formData.get('description');
    const orderRaw = formData.get('order');
    const order = typeof orderRaw === 'string' && orderRaw !== '' ? Number(orderRaw) : 0;

    const { uploadChatAttachment, deleteChatAttachment } = await import('@jazzmind/busibox-app');
    const libraryId = process.env.TRAINING_VIDEOS_LIBRARY_ID;

    console.info(
      '[video] upload starting',
      JSON.stringify({
        path: libraryId ? 'library' : 'chat-attachment',
        libraryId: libraryId ?? null,
        sizeBytes: file.size,
        mimeType: file.type,
        userId: auth.userId,
      }),
    );

    let uploaded: { fileId: string; mimeType: string; sizeBytes: number };
    try {
      if (libraryId) {
        uploaded = await uploadVideoToLibrary(file, libraryId, {
          accessToken: auth.apiToken,
          userId: auth.userId,
          timeout: UPLOAD_TIMEOUT_MS,
        });
      } else {
        const result = await uploadChatAttachment(file, {
          accessToken: auth.apiToken,
          userId: auth.userId,
          timeout: UPLOAD_TIMEOUT_MS,
        });
        uploaded = { fileId: result.fileId, mimeType: result.mimeType, sizeBytes: result.sizeBytes };
      }
    } catch (err) {
      console.error('[video] MinIO upload failed', err);
      const message = err instanceof Error ? err.message : 'Upload to storage failed';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    console.info(
      '[video] upload succeeded',
      JSON.stringify({
        path: libraryId ? 'library' : 'chat-attachment',
        fileId: uploaded.fileId,
      }),
    );
    let video;
    try {
      const ids = await ensureDataDocuments(auth.apiToken);
      video = await insertVideo(auth.apiToken, ids.trainingVideos, {
        moduleId,
        lessonId: typeof lessonId === 'string' && lessonId ? lessonId : undefined,
        title,
        description: typeof description === 'string' && description ? description : undefined,
        source: 'uploaded',
        fileId: uploaded.fileId,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes,
        order,
        uploadedBy: auth.userId,
      });
    } catch (err) {
      try { await deleteChatAttachment(uploaded.fileId, { accessToken: auth.apiToken }); }
      catch (cleanupErr) { console.error('[video] orphan cleanup failed', cleanupErr); }
      console.error('[video] insert failed after upload', err);
      return NextResponse.json({ error: 'Failed to record video metadata' }, { status: 500 });
    }
    return NextResponse.json(
      { ...video, _upload: { path: libraryId ? 'library' : 'chat-attachment', libraryId: libraryId ?? null } },
      { status: 201 },
    );
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
