import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { isAdminRole } from "@/lib/admin-roles";
import { listDataDocuments } from "@jazzmind/busibox-app";
import { DOCUMENTS } from "@/lib/data-api-client";

const SOURCE_APP = "cashman-ai-training";

/**
 * GET /api/debug/documents  — TEMPORARY, admin-only diagnostic.
 *
 * Read-only. Does NOT call ensureDataDocuments (that is what 500s). It lists
 * documents with and without the sourceApp filter and compares against the
 * expected document names, so we can tell which of these is happening:
 *
 *   - inUnfiltered=true            -> docs exist & are visible; the sourceApp
 *                                     filter was hiding them (the deployed fix
 *                                     lists unfiltered, so it resolves this).
 *   - inUnfiltered=false, low count-> docs exist (create collides) but are
 *                                     hidden from this token by RLS/ownership;
 *                                     needs a data fix, not a list change.
 *   - present under a different    -> name mismatch between code and storage.
 *     name in *Docs but not in
 *     presence
 *
 * DELETE THIS ROUTE once the issue is resolved.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;
  if (!isAdminRole(auth.roles)) {
    return NextResponse.json(
      { error: "admin only", roles: auth.roles },
      { status: 403 },
    );
  }

  const expected = Object.values(DOCUMENTS);

  type RawDoc = Record<string, unknown> & { id?: string; name?: string };
  const summarize = (docs: RawDoc[]) =>
    docs.map((d) => ({
      id: d.id,
      name: d.name,
      visibility: d.visibility ?? null,
      sourceApp: d.sourceApp ?? d.source_app ?? null,
      ownerId: d.ownerId ?? d.owner_id ?? d.createdBy ?? d.created_by ?? null,
    }));

  // The data layer throws errors that carry `.statusCode` and `.originalError`
  // (the real data-api error body, which may be an object). Capture all three
  // so the actual status + detail survive instead of stringifying to
  // "[object Object]".
  const describeError = (e: unknown) => {
    const err = e as { message?: string; statusCode?: number; originalError?: unknown };
    let original: unknown = err?.originalError;
    if (original !== undefined && typeof original !== "string") {
      try {
        original = JSON.parse(JSON.stringify(original));
      } catch {
        original = String(original);
      }
    }
    return {
      message: err?.message ?? String(e),
      statusCode: err?.statusCode ?? null,
      originalError: original ?? null,
    };
  };

  let unfiltered: RawDoc[] = [];
  let filtered: RawDoc[] = [];
  let unfilteredError: ReturnType<typeof describeError> | null = null;
  let filteredError: ReturnType<typeof describeError> | null = null;

  try {
    unfiltered = (await listDataDocuments(auth.apiToken, { limit: 200 })) as RawDoc[];
  } catch (e) {
    unfilteredError = describeError(e);
  }
  try {
    filtered = (await listDataDocuments(auth.apiToken, {
      sourceApp: SOURCE_APP,
      limit: 200,
    })) as RawDoc[];
  } catch (e) {
    filteredError = describeError(e);
  }

  const unfilteredNames = new Set(unfiltered.map((d) => d.name));
  const filteredNames = new Set(filtered.map((d) => d.name));

  return NextResponse.json({
    userId: auth.userId,
    roles: auth.roles,
    counts: { unfiltered: unfiltered.length, filtered: filtered.length },
    presence: expected.map((name) => ({
      name,
      inUnfiltered: unfilteredNames.has(name),
      inFiltered: filteredNames.has(name),
    })),
    unfilteredError,
    filteredError,
    unfilteredDocs: summarize(unfiltered),
    filteredDocs: summarize(filtered),
  });
}
