import { NextRequest, NextResponse } from "next/server";
import {
  getDocumentRoles,
  updateDocumentRoles,
  queryRecords,
  bulkSetRecordVisibility,
} from "@jazzmind/busibox-app";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { isAdminRole } from "@/lib/admin-roles";
import { ensureDataDocuments } from "@/lib/data-api-client";

/**
 * POST /api/admin/visibility/repair  — TEMPORARY, admin-only repair.
 *
 * Background: data-api visibility is only set when a document is first created.
 * The shared "course" documents were created as `personal`, so only the admin
 * (the creator) can see them and every other user sees nothing.
 *
 * This route flips the SHARED-CONTENT documents to `authenticated` (readable by
 * every signed-in app user) AND flips their existing rows to `inherit`, because
 * a record keeps its own creator-personal row-level visibility even after the
 * document is opened up. The per-user PRIVATE documents (quiz answers, activity
 * responses, video position) are deliberately left untouched.
 *
 *   GET  — read-only dry run: report each document's current visibility + row count.
 *   POST — apply: set shared docs to `authenticated` and their rows to `inherit`.
 *
 * DELETE THIS ROUTE once the data is fixed.
 */

const DIAGNOSTIC_VERSION = "visibility-repair-v1";

// Keys into ensureDataDocuments() that should be readable by all app users.
const PUBLIC_DOC_KEYS = [
  "progress",
  "badges",
  "trainingVideos",
  "submissionFiles",
  "trainingUsers",
  "surveyResponses",
] as const;

// Deliberately kept personal (per-user private data).
const PRIVATE_DOC_KEYS = [
  "quizScores",
  "activityResponses",
  "trainingVideoProgress",
] as const;

const TARGET_VISIBILITY = "authenticated";

// Collect every record id in a document, paginating past the default page size.
async function listAllRecordIds(
  token: string,
  documentId: string,
): Promise<string[]> {
  const ids: string[] = [];
  const limit = 200;
  let offset = 0;
  // Hard cap so a misbehaving response can never loop forever.
  for (let page = 0; page < 100; page++) {
    const { records } = await queryRecords<{ id: string }>(token, documentId, {
      select: ["id"],
      limit,
      offset,
    });
    if (!records.length) break;
    for (const r of records) {
      if (r?.id) ids.push(r.id);
    }
    if (records.length < limit) break;
    offset += limit;
  }
  return ids;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;
  if (!isAdminRole(auth.roles)) {
    return NextResponse.json(
      { diagnosticVersion: DIAGNOSTIC_VERSION, error: "admin only", roles: auth.roles },
      { status: 403 },
    );
  }
  const token = auth.apiToken;

  const ids = await ensureDataDocuments(token);

  async function inspect(key: keyof typeof ids) {
    const documentId = ids[key];
    try {
      const roles = await getDocumentRoles(token, documentId);
      const recordIds = await listAllRecordIds(token, documentId);
      return {
        key,
        documentId,
        visibility: roles.visibility,
        roleIds: roles.roleIds,
        recordCount: recordIds.length,
      };
    } catch (e) {
      return {
        key,
        documentId,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  const publicDocs = await Promise.all(PUBLIC_DOC_KEYS.map((k) => inspect(k)));
  const privateDocs = await Promise.all(PRIVATE_DOC_KEYS.map((k) => inspect(k)));

  return NextResponse.json({
    diagnosticVersion: DIAGNOSTIC_VERSION,
    mode: "dry-run",
    targetVisibilityForPublic: TARGET_VISIBILITY,
    publicDocs,
    privateDocs,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;
  if (!isAdminRole(auth.roles)) {
    return NextResponse.json(
      { diagnosticVersion: DIAGNOSTIC_VERSION, error: "admin only", roles: auth.roles },
      { status: 403 },
    );
  }
  const token = auth.apiToken;

  const ids = await ensureDataDocuments(token);
  const results: Array<Record<string, unknown>> = [];

  for (const key of PUBLIC_DOC_KEYS) {
    const documentId = ids[key];
    const result: Record<string, unknown> = { key, documentId };
    try {
      // 1) Open the document to every authenticated app user. Clear any stray
      //    bound roles (an orphaned role can otherwise gate reads). The library
      //    type only advertises 'personal' | 'shared', but the data-api roles
      //    endpoint accepts the stored 'authenticated' visibility too.
      await updateDocumentRoles(
        token,
        documentId,
        [],
        TARGET_VISIBILITY as "shared",
      );
      result.documentVisibilitySet = TARGET_VISIBILITY;

      // 2) Flip existing rows to inherit the document visibility. Without this,
      //    rows created while the doc was personal stay owner-only.
      const recordIds = await listAllRecordIds(token, documentId);
      if (recordIds.length > 0) {
        await bulkSetRecordVisibility(token, documentId, recordIds, "inherit");
      }
      result.recordsFlippedToInherit = recordIds.length;
    } catch (e) {
      result.error = e instanceof Error ? e.message : String(e);
    }
    results.push(result);
  }

  const allOk = results.every((r) => !r.error);
  return NextResponse.json({
    diagnosticVersion: DIAGNOSTIC_VERSION,
    mode: "apply",
    success: allOk,
    targetVisibilityForPublic: TARGET_VISIBILITY,
    leftUntouched: PRIVATE_DOC_KEYS,
    results,
  });
}
