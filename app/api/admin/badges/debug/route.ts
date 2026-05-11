import { NextRequest, NextResponse } from 'next/server';
import {
  extractAppRoleIdFromToken,
  getDocumentRoles,
  queryRecords,
} from '@jazzmind/busibox-app';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import type { Badge } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * GET /api/admin/badges/debug
 *
 * Reports the badges document's id, visibility, and bound roles, plus the
 * caller's appRoleId. Use this to confirm whether the doc is bound to
 * app:cashman-ai-training (which is what makes inserts visible on read).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const ids = await ensureDataDocuments(auth.apiToken);
  const appRoleIds = extractAppRoleIdFromToken(auth.apiToken, 'cashman-ai-training');
  const rolesInfo = await getDocumentRoles(auth.apiToken, ids.badges);
  const totalRecords = await queryRecords<Badge>(auth.apiToken, ids.badges, { limit: 1 });

  return NextResponse.json({
    badgesDocumentId: ids.badges,
    visibility: rolesInfo.visibility,
    boundRoleIds: rolesInfo.roleIds ?? [],
    boundRoles: rolesInfo.roles ?? [],
    callerAppRoleId: appRoleIds[0] ?? null,
    callerAppRoleBound:
      !!appRoleIds[0] &&
      (rolesInfo.roleIds ?? []).includes(appRoleIds[0]),
    sampleRecordVisible: totalRecords.records.length > 0,
  });
}
