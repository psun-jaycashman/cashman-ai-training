import { NextRequest, NextResponse } from 'next/server';
import { getChatAttachmentUrl } from '@jazzmind/busibox-app';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments } from '@/lib/data-api-client';
import { listSubmissions } from '@/lib/submission-data-api';
import { displayNameFromEmail } from '@/lib/display-name';

export const runtime = 'nodejs';

const PRESIGN_SECONDS = 3600;

/**
 * GET /api/submissions
 *
 * Cross-user readable list of every peer exercise submission. Each row
 * includes a freshly presigned download URL (1h expiry).
 *
 * Query params:
 *   - moduleId   filter to one module
 *   - lessonId   filter to one lesson within a module
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get('moduleId') || undefined;
  const lessonId = searchParams.get('lessonId') || undefined;

  const ids = await ensureDataDocuments(auth.apiToken);
  const records = await listSubmissions(auth.apiToken, ids.submissionFiles, {
    moduleId,
    lessonId,
  });

  const submissions = await Promise.all(records.map(async (r) => {
    let downloadUrl: string | null = null;
    let downloadError: string | null = null;
    try {
      downloadUrl = await getChatAttachmentUrl(
        r.fileId,
        { accessToken: auth.apiToken },
        PRESIGN_SECONDS,
      );
    } catch (err) {
      // File is in the shared library but the role isn't bound — same
      // failure mode the training-videos route hits when STUDENT_SUBMISSIONS_LIBRARY_ID
      // is set but the role binding hasn't been done in data-api admin.
      console.warn(
        '[submissions] presigned URL failed for',
        r.id,
        'fileId',
        r.fileId,
        'as user',
        auth.userId,
        err instanceof Error ? err.message : err,
      );
      downloadError = 'File not accessible — ask the admin to bind the app role to the submissions library.';
    }
    const displayName = displayNameFromEmail(r.uploaderEmail) ?? 'Anonymous';
    const isMine = r.uploaderUserId === auth.userId;
    return {
      id: r.id,
      moduleId: r.moduleId,
      lessonId: r.lessonId,
      lessonTitle: r.lessonTitle ?? null,
      exerciseId: r.exerciseId,
      fileName: r.fileName,
      mimeType: r.mimeType ?? null,
      sizeBytes: r.sizeBytes ?? null,
      responseExcerpt: r.responseExcerpt ?? null,
      uploadedAt: r.uploadedAt,
      uploaderUserId: r.uploaderUserId,
      uploaderName: displayName,
      isMine,
      downloadUrl,
      downloadError,
      expiresAt: downloadUrl
        ? new Date(Date.now() + PRESIGN_SECONDS * 1000).toISOString()
        : null,
    };
  }));

  return NextResponse.json({
    submissions,
    libraryConfigured: !!process.env.STUDENT_SUBMISSIONS_LIBRARY_ID,
  });
}
