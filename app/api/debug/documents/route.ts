import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { isAdminRole } from "@/lib/admin-roles";
import { DOCUMENTS } from "@/lib/data-api-client";

const SOURCE_APP = "cashman-ai-training";

// Bump this whenever the route changes so we can confirm a deploy actually
// shipped the latest version (look for it in the JSON response).
const DIAGNOSTIC_VERSION = "raw-fetch-v3";

/**
 * GET /api/debug/documents  — TEMPORARY, admin-only diagnostic.
 *
 * Read-only. Does a RAW fetch straight to the data-api `/data` list endpoint,
 * bypassing the busibox client's error handling (which stringified the real
 * data-api error body to "[object Object]"). Returns the exact HTTP status and
 * raw body so we can see why listing documents fails for this token.
 *
 * DELETE THIS ROUTE once the issue is resolved.
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
  // Capture the token here (auth is narrowed to AuthenticatedRequest after the
  // guard above) so the nested closure doesn't widen it back to the union.
  const apiToken = auth.apiToken;

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
      return {
        url,
        status: null,
        statusText: null,
        ok: false,
        fetchError: e instanceof Error ? e.message : String(e),
      };
    }
  }

  const unfiltered = await rawList("?limit=200");
  const filtered = await rawList(`?sourceApp=${encodeURIComponent(SOURCE_APP)}&limit=200`);

  return NextResponse.json({
    diagnosticVersion: DIAGNOSTIC_VERSION,
    userId: auth.userId,
    roles: auth.roles,
    dataApiUrl: dataUrl,
    expectedDocumentNames: Object.values(DOCUMENTS),
    rawUnfilteredList: unfiltered,
    rawFilteredList: filtered,
  });
}
