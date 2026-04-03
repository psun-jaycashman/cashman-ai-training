import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  getUserBadges,
  getUserQuizScores,
} from "@/lib/data-api-client";

/**
 * GET /api/certificate
 *
 * Returns certificate data if the user has earned the think-aimpossible badge.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);

    const [badges, quizScores] = await Promise.all([
      getUserBadges(auth.apiToken, documentIds.badges, auth.userId),
      getUserQuizScores(auth.apiToken, documentIds.quizScores, auth.userId),
    ]);

    const thinkAimpossible = badges.find((b) => b.badgeType === "think-aimpossible");

    if (!thinkAimpossible) {
      return NextResponse.json({ eligible: false });
    }

    // Calculate total quiz score
    const totalScore = quizScores.reduce((sum, s) => sum + s.score, 0);
    const totalMaxScore = quizScores.reduce((sum, s) => sum + s.maxScore, 0);
    const scorePercentage =
      totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    return NextResponse.json({
      eligible: true,
      certificate: {
        userName: auth.userId,
        completionDate: thinkAimpossible.earnedAt,
        totalScore: scorePercentage,
        badgesEarned: badges.length,
      },
    });
  } catch (error) {
    console.error("[CERTIFICATE] Failed to fetch certificate:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch certificate",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
