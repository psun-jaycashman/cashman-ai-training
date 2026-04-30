import { NextRequest, NextResponse } from 'next/server';
import { bulkSetRecordVisibility, queryRecords } from '@jazzmind/busibox-app';
import { requireAdmin } from '@/lib/video-admin-role';
import { ensureDataDocuments } from '@/lib/data-api-client';
import type { UserProgress } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * POST /api/admin/progress/backfill-visibility
 *
 * Re-stamps every existing progress record with recordVisibility: 'inherit'
 * so it follows the document's 'shared' visibility instead of the silent
 * creator-personal default. One-shot fix for rows written before
 * markLessonComplete() was updated to pass the option.
 *
 * Same idea as /api/admin/training-videos/backfill-visibility.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const ids = await ensureDataDocuments(auth.apiToken);
  // Pull all progress rows in batches; data-api caps queryRecords at 100/req
  // by default, so paginate until we've drained the document.
  const allIds: string[] = [];
  let offset = 0;
  const pageSize = 500;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await queryRecords<UserProgress>(auth.apiToken, ids.progress, {
      limit: pageSize,
      offset,
    });
    if (page.records.length === 0) break;
    for (const r of page.records) allIds.push(r.id);
    if (page.records.length < pageSize) break;
    offset += pageSize;
  }

  if (allIds.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  await bulkSetRecordVisibility(
    auth.apiToken,
    ids.progress,
    allIds,
    'inherit',
  );

  return NextResponse.json({ updated: allIds.length });
}
