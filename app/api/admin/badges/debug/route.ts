import { NextRequest, NextResponse } from 'next/server';
import {
  extractAppRoleIdFromToken,
  extractRoleIdsFromToken,
  getDocumentRoles,
  queryRecords,
} from '@jazzmind/busibox-app';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';

export const runtime = 'nodejs';

/**
 * GET /api/admin/badges/debug
 *
 * Reports doc state for badges *and* progress side-by-side so we can
 * compare a working doc (progress, which the user can read 15 of) with
 * the broken one (badges, which inserts but stays invisible). The most
 * useful field is `boundRoleIds` overlap with `callerRoleIds`.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const apiToken = auth.apiToken;
  const ids = await ensureDataDocuments(apiToken);
  const appRoleIds = extractAppRoleIdFromToken(apiToken, 'cashman-ai-training');
  const callerRoleIds = extractRoleIdsFromToken(apiToken);

  async function describe(documentId: string) {
    const roles = await getDocumentRoles(apiToken, documentId);
    const sample = await queryRecords(apiToken, documentId, { limit: 1 });
    const boundRoleIds = roles.roleIds ?? [];
    return {
      documentId,
      visibility: roles.visibility,
      boundRoleIds,
      boundRoles: roles.roles ?? [],
      sampleRecordVisible: sample.records.length > 0,
      sampleTotalReported: sample.total,
      overlapWithCaller: boundRoleIds.filter((id) => callerRoleIds.includes(id)),
    };
  }

  const [badges, progress, trainingUsers] = await Promise.all([
    describe(ids.badges),
    describe(ids.progress),
    describe(ids.trainingUsers),
  ]);

  return NextResponse.json({
    caller: {
      userId: auth.userId,
      roles: auth.roles,
      callerAppRoleId: appRoleIds[0] ?? null,
      callerRoleIdCount: callerRoleIds.length,
      callerRoleIds,
    },
    docs: {
      badges,
      progress,
      trainingUsers,
    },
  });
}
