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
 * document so the leaderboard / admin view can show every active user
 * with a real display name instead of only those who have completed a
 * lesson.
 *
 * Called from the (authenticated) layout on mount. Accepts optional
 * `{ email, displayName }` in the body — the data-api token does not
 * always carry an email claim, so we use the client-supplied values
 * (which come from useSession()) as a fallback. The visitorId is
 * always taken from the verified token, never from the body.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, 'data-api');
  if (auth instanceof NextResponse) return auth;

  let bodyEmail: string | undefined;
  let bodyDisplayName: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.email === 'string' && body.email.trim()) {
      bodyEmail = body.email.trim();
    }
    if (typeof body?.displayName === 'string' && body.displayName.trim()) {
      bodyDisplayName = body.displayName.trim();
    }
  } catch {
    // Body is optional; ignore malformed JSON.
  }

  const tokenEmail = getUserEmailFromToken(auth.apiToken)
    ?? (auth.ssoToken ? getUserEmailFromToken(auth.ssoToken) : null)
    ?? null;

  const email = tokenEmail ?? bodyEmail;
  const displayName =
    bodyDisplayName ?? displayNameFromEmail(email) ?? undefined;

  const ids = await ensureDataDocuments(auth.apiToken);
  const profile = await upsertTrainingUser(auth.apiToken, ids.trainingUsers, {
    visitorId: auth.userId,
    email,
    displayName,
  });

  return NextResponse.json({ profile });
}
