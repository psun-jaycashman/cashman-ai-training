import { NextRequest, NextResponse } from 'next/server';
import { getUserEmailFromToken } from '@jazzmind/busibox-app/lib/authz';
import { requireAuthWithTokenExchange } from '@/lib/auth-middleware';
import { ensureDataDocuments, upsertTrainingUser } from '@/lib/data-api-client';
import { displayNameFromEmail } from '@/lib/display-name';

export const runtime = 'nodejs';

/**
 * POST /api/users/me
 *
 * Idempotent. Stamps the calling user into the ai-training-users
 * document so the leaderboard can show every active user (with a real
 * display name) instead of only those who have completed a lesson.
 *
 * Called once on mount from the (authenticated) layout — no body needed,
 * everything we record is derived from the session token.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;

  const email = getUserEmailFromToken(auth.apiToken)
    ?? (auth.ssoToken ? getUserEmailFromToken(auth.ssoToken) : null)
    ?? undefined;
  const displayName = displayNameFromEmail(email) ?? undefined;

  const ids = await ensureDataDocuments(auth.apiToken);
  const profile = await upsertTrainingUser(auth.apiToken, ids.trainingUsers, {
    visitorId: auth.userId,
    email,
    displayName,
  });

  return NextResponse.json({ profile });
}
