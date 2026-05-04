import { NextRequest, NextResponse } from 'next/server';
import { extractAppRoleIdFromToken } from '@jazzmind/busibox-app';
import { requireAdmin } from '@/lib/video-admin-role';

export const runtime = 'nodejs';

/**
 * GET /api/admin/submissions/debug
 *
 * Admin-only. Surfaces just enough environment state to diagnose why a
 * submission file didn't get scoped to the shared library. Hit this from
 * a browser tab while logged in as an admin to copy the appRoleId you
 * need to bind to the library in the data-api admin UI.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const libraryIdEnv = process.env.STUDENT_SUBMISSIONS_LIBRARY_ID ?? null;
  const appRoleIds = extractAppRoleIdFromToken(auth.apiToken, 'cashman-ai-training');

  return NextResponse.json({
    env: {
      // Whether the running Node process has STUDENT_SUBMISSIONS_LIBRARY_ID set.
      // false ⇒ /api/activities/evaluate skips the library-upload branch
      // even if .env on disk has it set (process needs a restart).
      STUDENT_SUBMISSIONS_LIBRARY_ID_set: libraryIdEnv !== null,
      STUDENT_SUBMISSIONS_LIBRARY_ID_value: libraryIdEnv,
      DATA_API_URL: process.env.DATA_API_URL ?? null,
      APP_NAME: process.env.APP_NAME ?? null,
      NODE_ENV: process.env.NODE_ENV ?? null,
    },
    user: {
      userId: auth.userId,
      roles: auth.roles,
      // Bind this role to the submissions library in data-api admin so
      // every authenticated app user can resolve presigned URLs.
      appRoleId: appRoleIds[0] ?? null,
    },
  });
}
