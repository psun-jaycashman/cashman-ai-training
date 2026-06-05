import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { isAdminRole } from "@/lib/admin-roles";
import { listDataDocuments } from "@jazzmind/busibox-app";
import { DOCUMENTS, ensureDataDocuments } from "@/lib/data-api-client";

const SOURCE_APP = "cashman-ai-training";

// Bump this whenever the route changes so we can confirm a deploy actually
// shipped the latest version (look for it in the JSON response).
const DIAGNOSTIC_VERSION = "raw-fetch-v4";

/**
 * GET /api/debug/documents  — TEMPORARY, admin-only diagnostic.
 *
 * Read-only. Surfaces exactly what the data-api returns for this token when
 * LISTING documents, plus what the busibox client + ensureDataDocuments do with
 * it. The data-api caps `limit` at 100, so we list with limit=100 (v3 used 200
 * and got a misleading 422). DELETE THIS ROUTE once the issue is resolved.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;
  if (!isAdminRole(auth.roles)) {
    return NextResponse.json(
      { diagnosticVersion: DIAGNOSTIC_VERSION, error: "admin only", roles: auth.roles },
      { status: 403 },
    );
  }

  const dataUrl = (process.env.DATA_API_URL || "http://localhost:8002").replace(/\/+$/, "");
  const apiToken = auth.apiToken;

  // 1) Raw fetch straight to data-api so we see the exact status + body,
  //    including each stored document's owner/visibility/sourceApp fields.
  async function rawList(qs: string) {
    const url = `${dataUrl}/data${qs}`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      });
      const bodyText = await res.text();
      let bodyJson: unknown = null;
      try {
        bodyJson = JSON.parse(bodyText);
      } catch {
        /* leave as raw text */
      }
      return {
        url,
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        body: bodyJson ?? bodyText.slice(0, 4000),
      };
    } catch (e) {
      return { url, status: null, ok: false, fetchError: e instanceof Error ? e.message : String(e) };
    }
  }

  const rawUnfiltered = await rawList("?limit=100");
  const rawFiltered = await rawList(`?sourceApp=${encodeURIComponent(SOURCE_APP)}&limit=100`);

  // 2) The actual library call ensureDataDocuments relies on.
  let libraryList: { count: number; names: string[] } | { error: string } = { count: 0, names: [] };
  try {
    const docs = await listDataDocuments(apiToken, { limit: 100 });
    libraryList = { count: docs.length, names: docs.map((d) => d.name) };
  } catch (e) {
    libraryList = { error: e instanceof Error ? e.message : String(e) };
  }

  // 3) The exact failure every route hits — capture message, not "[object Object]".
  let ensureResult: { ids: Record<string, string> } | { error: string; name?: string } = { ids: {} };
  try {
    const ids = await ensureDataDocuments(apiToken);
    ensureResult = { ids };
  } catch (e) {
    ensureResult = {
      error: e instanceof Error ? e.message : String(e),
      name: e instanceof Error ? e.name : undefined,
    };
  }

  return NextResponse.json({
    diagnosticVersion: DIAGNOSTIC_VERSION,
    userId: auth.userId,
    roles: auth.roles,
    dataApiUrl: dataUrl,
    expectedDocumentNames: Object.values(DOCUMENTS),
    rawUnfilteredList: rawUnfiltered,
    rawFilteredList: rawFiltered,
    libraryListDataDocuments: libraryList,
    ensureDataDocuments: ensureResult,
  });
}
