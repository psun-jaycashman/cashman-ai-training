import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  getUserBadges,
} from "@/lib/data-api-client";
import { BADGE_DEFINITIONS } from "@/lib/module-data";
import { evaluateAndAwardBadges, type BadgeEvalFailure } from "@/lib/badge-eval";

/**
 * GET /api/badges
 *
 * Returns the current user's earned badges along with all badge definitions.
 * Also runs evaluateAndAwardBadges so any badge the user *should* have
 * earned but didn't (e.g. award failed silently on a previous deploy)
 * gets retroactively awarded the next time they load their profile.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);
    // Best-effort retro-award. If it errors (e.g. data-api hiccup), still
    // return whatever badges the user has so the page renders.
    let evalFailures: BadgeEvalFailure[] = [];
    let evalError: string | null = null;
    try {
      const result = await evaluateAndAwardBadges(
        auth.apiToken,
        documentIds,
        auth.userId,
      );
      evalFailures = result.failures;
    } catch (err) {
      console.error("[BADGES] retro-award failed; returning current state", err);
      evalError = err instanceof Error ? err.message : String(err);
    }
    const earned = await getUserBadges(auth.apiToken, documentIds.badges, auth.userId);

    return NextResponse.json({
      badges: BADGE_DEFINITIONS,
      earned,
      diagnostics: {
        failures: evalFailures,
        error: evalError,
      },
    });
  } catch (error) {
    console.error("[BADGES] Failed to fetch badges:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch badges",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/badges
 *
 * Check and award any new badges the user has earned.
 * Called after lesson completion or quiz submission.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);
    const { newBadges, earnedTypes } = await evaluateAndAwardBadges(
      auth.apiToken,
      documentIds,
      auth.userId,
    );
    return NextResponse.json({ newBadges, totalBadges: earnedTypes.size });
  } catch (error) {
    console.error("[BADGES] Failed to check badges:", error);
    return NextResponse.json(
      {
        error: "Failed to check badges",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
