import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/video-admin-role';
import { extractAppRoleIdFromToken } from '@jazzmind/busibox-app';

export const runtime = 'nodejs';

/**
 * GET /api/admin/training-videos/debug
 *
 * Admin-only. Surfaces just enough environment state to diagnose why an
 * upload didn't get scoped to the shared library. Hit this from a browser
 * tab while logged in as admin.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const libraryIdEnv = process.env.TRAINING_VIDEOS_LIBRARY_ID ?? null;
  const appRoleIds = extractAppRoleIdFromToken(auth.apiToken, 'cashman-ai-training');

  return NextResponse.json({
    env: {
      // Whether the running Node process has TRAINING_VIDEOS_LIBRARY_ID set.
      // false ⇒ admin upload route still uses the user-scoped chat-attachment
      // path no matter what is in .env on disk.
      TRAINING_VIDEOS_LIBRARY_ID_set: libraryIdEnv !== null,
      TRAINING_VIDEOS_LIBRARY_ID_value: libraryIdEnv,
      DATA_API_URL: process.env.DATA_API_URL ?? null,
      APP_NAME: process.env.APP_NAME ?? null,
      NODE_ENV: process.env.NODE_ENV ?? null,
    },
    user: {
      userId: auth.userId,
      roles: auth.roles,
      // The role that should be bound to the shared library so every
      // app-authenticated user can read the file.
      appRoleId: appRoleIds[0] ?? null,
    },
  });
}
