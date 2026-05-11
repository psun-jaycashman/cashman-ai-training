import { NextRequest, NextResponse } from 'next/server';
import {
  deleteRecords,
  getDocumentRoles,
  queryRecords,
  updateDocumentRoles,
} from '@jazzmind/busibox-app';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';

export const runtime = 'nodejs';

/**
 * POST /api/admin/badges/repair
 *
 * One-shot repair for the ai-training-badges document.
 *
 * Symptom: data-api accepted inserts (returned count=1 + recordIds) but
 * the inserter could not read the row back. Cause: the doc was bound to
 * a stray "User" role that nobody's token actually carries, so records
 * inheriting `shared+[User]` became invisible to everyone.
 *
 * This route:
 *   1. Strips ALL role bindings on the badges doc and switches it to
 *      'authenticated' visibility (matches trainingUsers, the closest
 *      working analog). The SDK's TS sig restricts updateDocumentRoles to
 *      'personal' | 'shared' but the underlying API endpoint accepts
 *      'authenticated' too — createDataDocument proves it — so we cast.
 *   2. Pages through every existing badge record and deletes them. They
 *      were stamped with the bad visibility at insert time and aren't
 *      worth re-stamping; the next eval pass on the profile page will
 *      regenerate every badge the user has earned.
 *
 * Idempotent: safe to re-run. After running, refresh the profile page.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const apiToken = auth.apiToken;
  const ids = await ensureDataDocuments(apiToken);

  const before = await getDocumentRoles(apiToken, ids.badges);

  // Step 1: clear roles + set visibility to 'authenticated'.
  // The SDK type narrows to 'personal' | 'shared' but the wire protocol
  // accepts 'authenticated' (see createDataDocument).
  await updateDocumentRoles(
    apiToken,
    ids.badges,
    [],
    'authenticated' as 'personal' | 'shared',
  );

  const after = await getDocumentRoles(apiToken, ids.badges);

  // Step 2: wipe orphan records. Page through every row id and delete.
  const orphanIds: string[] = [];
  const pageSize = 500;
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await queryRecords<{ id: string }>(apiToken, ids.badges, {
      limit: pageSize,
      offset,
    });
    for (const row of page.records) orphanIds.push(row.id);
    if (page.records.length < pageSize) break;
    offset += pageSize;
  }

  let deleted = 0;
  if (orphanIds.length > 0) {
    const result = await deleteRecords(apiToken, ids.badges, undefined, orphanIds);
    deleted = result.count;
  }

  return NextResponse.json({
    badgesDocumentId: ids.badges,
    rolesBefore: {
      visibility: before.visibility,
      roleIds: before.roleIds ?? [],
      roles: before.roles ?? [],
    },
    rolesAfter: {
      visibility: after.visibility,
      roleIds: after.roleIds ?? [],
      roles: after.roles ?? [],
    },
    orphansDeleted: deleted,
    nextStep:
      'Refresh the profile page. evaluateAndAwardBadges will re-insert every badge the user has earned, and they should now be visible.',
  });
}
