import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  getUserProgress,
  getUserQuizScores,
} from "@/lib/data-api-client";
import { BADGE_DEFINITIONS } from "@/lib/module-data";
import { computeEarnedBadges } from "@/lib/badge-eval";

/**
 * GET /api/badges
 *
 * Returns the badge catalog plus the current user's earned badges.
 * Earned badges are computed on the fly from the user's progress and
 * quiz scores — no data-api badge document is read or written. The
 * caller's profile page renders BadgeGrid from `earned`.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);
    const [progress, quizScores] = await Promise.all([
      getUserProgress(auth.apiToken, documentIds.progress, auth.userId),
      getUserQuizScores(auth.apiToken, documentIds.quizScores, auth.userId),
    ]);

    const earned = computeEarnedBadges({
      visitorId: auth.userId,
      progress,
      quizScores,
    });

    return NextResponse.json({
      badges: BADGE_DEFINITIONS,
      earned,
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
 * Kept for backwards compat with the profile page's "Refresh" button —
 * recomputes and returns the earned set. With compute-on-the-fly there's
 * nothing to "award", so this is functionally equivalent to GET.
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
