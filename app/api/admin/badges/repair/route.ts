import { NextRequest, NextResponse } from 'next/server';
import {
  addRoleToDocuments,
  bulkSetRecordVisibility,
  deleteRecords,
  extractAppRoleIdFromToken,
  getDocumentRoles,
  queryRecords,
} from '@jazzmind/busibox-app';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';

export const runtime = 'nodejs';

interface StoredBadgeRow {
  id: string;
  visitorId: string;
  badgeType: string;
  earnedAt?: string;
}

/**
 * POST /api/admin/badges/repair
 *
 * One-shot repair for the ai-training-badges document. Background:
 * inserts had been silently invisible — the data-api accepted writes
 * (returned count=1 + recordIds) but the inserter could not read the
 * record back, so each lesson-completion + refresh attempted another
 * insert and accumulated orphan rows.
 *
 * Root cause: the document was created with visibility 'authenticated'
 * but no app role bound. Records inserted with recordVisibility:
 * 'inherit' inherited an empty role set and became invisible to every
 * caller, including the creator.
 *
 * This route:
 *   1. Binds app:cashman-ai-training to the badges document (idempotent).
 *   2. Reads every existing badge row (paginated) and dedupes by
 *      (visitorId, badgeType), keeping the oldest by earnedAt.
 *   3. Deletes the duplicates.
 *   4. Re-stamps the survivors with recordVisibility 'inherit' so they
 *      follow the now-bound role and become visible to their owners.
 *
 * Idempotent: safe to re-run.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const ids = await ensureDataDocuments(auth.apiToken);

  const appRoleId = extractAppRoleIdFromToken(auth.apiToken, 'cashman-ai-training')[0];
  if (!appRoleId) {
    return NextResponse.json(
      {
        error: 'Caller token does not contain an app:cashman-ai-training role.',
        hint: 'Confirm the user has app access in authz before retrying.',
      },
      { status: 400 },
    );
  }

  // 1. Bind the app role to the badges document. addRoleToDocuments is
  //    idempotent so this is safe whether or not it was already bound.
  await addRoleToDocuments(auth.apiToken, appRoleId, [ids.badges]);

  const rolesAfterBind = await getDocumentRoles(auth.apiToken, ids.badges);

  // 2. Page through every badge row. The doc role was just added so this
  //    call sees rows that the original inserter never could.
  const all: StoredBadgeRow[] = [];
  const pageSize = 500;
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await queryRecords<StoredBadgeRow>(auth.apiToken, ids.badges, {
      limit: pageSize,
      offset,
    });
    all.push(...page.records);
    if (page.records.length < pageSize) break;
    offset += pageSize;
  }

  // 3. Group by (visitorId, badgeType); keep the oldest earnedAt, mark
  //    the rest for deletion.
  const keepers = new Map<string, StoredBadgeRow>();
  const dupes: string[] = [];
  for (const row of all) {
    const key = `${row.visitorId}::${row.badgeType}`;
    const existing = keepers.get(key);
    if (!existing) {
      keepers.set(key, row);
      continue;
    }
    const existingTime = Date.parse(existing.earnedAt ?? '') || Number.POSITIVE_INFINITY;
    const rowTime = Date.parse(row.earnedAt ?? '') || Number.POSITIVE_INFINITY;
    if (rowTime < existingTime) {
      dupes.push(existing.id);
      keepers.set(key, row);
    } else {
      dupes.push(row.id);
    }
  }

  let deleted = 0;
  if (dupes.length > 0) {
    const result = await deleteRecords(auth.apiToken, ids.badges, undefined, dupes);
    deleted = result.count;
  }

  // 4. Re-stamp survivors with 'inherit' so they pick up the bound role.
  const survivorIds = Array.from(keepers.values()).map((r) => r.id);
  let restamped = 0;
  if (survivorIds.length > 0) {
    const result = await bulkSetRecordVisibility(
      auth.apiToken,
      ids.badges,
      survivorIds,
      'inherit',
    );
    restamped = result.updated;
  }

  return NextResponse.json({
    badgesDocumentId: ids.badges,
    appRoleId,
    docVisibility: rolesAfterBind.visibility,
    docBoundRoleIds: rolesAfterBind.roleIds ?? [],
    totalRowsScanned: all.length,
    duplicatesDeleted: deleted,
    survivorsRestamped: restamped,
    survivorsByBadgeType: Array.from(keepers.values()).reduce<Record<string, number>>(
      (acc, r) => {
        acc[r.badgeType] = (acc[r.badgeType] ?? 0) + 1;
        return acc;
      },
      {},
    ),
  });
}
