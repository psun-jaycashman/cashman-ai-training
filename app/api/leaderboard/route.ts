import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getAllBadges } from "@/lib/data-api-client";
import { queryRecords } from "@jazzmind/busibox-app";
import type { UserProgress, LeaderboardEntry } from "@/lib/types";

/**
 * GET /api/leaderboard
 *
 * Returns top 10 users by points plus the current user's rank.
 * Points: 10 pts per lesson completed, 25 pts per badge. Quiz scores are
 * intentionally excluded — quiz answers are private and quizScores rows
 * stay personal-scoped, so reading them cross-user would either leak
 * answers or undercount everyone but the requester.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);

    // Fetch progress and badges (both cross-user readable when
    // recordVisibility is 'inherit' on a 'shared'/'authenticated' doc).
    const [progressResult, allBadges] = await Promise.all([
      queryRecords<UserProgress>(auth.apiToken, documentIds.progress, {
        orderBy: [{ field: "startedAt", direction: "desc" }],
      }),
      getAllBadges(auth.apiToken, documentIds.badges),
    ]);

    // Group by visitor
    const visitorStats = new Map<
      string,
      { lessonsCompleted: number; badgeCount: number }
    >();

    function getStats(visitorId: string) {
      if (!visitorStats.has(visitorId)) {
        visitorStats.set(visitorId, {
          lessonsCompleted: 0,
          badgeCount: 0,
        });
      }
      return visitorStats.get(visitorId)!;
    }

    // Count unique completed lessons per visitor
    const completedLessonsMap = new Map<string, Set<string>>();
    for (const p of progressResult.records) {
      if (!p.completed) continue;
      if (!completedLessonsMap.has(p.visitorId)) {
        completedLessonsMap.set(p.visitorId, new Set());
      }
      completedLessonsMap.get(p.visitorId)!.add(`${p.moduleId}:${p.lessonId}`);
    }

    for (const [visitorId, lessons] of completedLessonsMap) {
      getStats(visitorId).lessonsCompleted = lessons.size;
    }

    // Count badges per visitor
    const badgeCountMap = new Map<string, number>();
    for (const b of allBadges) {
      badgeCountMap.set(b.visitorId, (badgeCountMap.get(b.visitorId) ?? 0) + 1);
    }
    for (const [visitorId, count] of badgeCountMap) {
      getStats(visitorId).badgeCount = count;
    }

    // Calculate total points and build leaderboard
    const entries: LeaderboardEntry[] = [];
    for (const [visitorId, stats] of visitorStats) {
      const totalPoints =
        stats.lessonsCompleted * 10 + stats.badgeCount * 25;

      entries.push({
        visitorId,
        displayName: visitorId, // Display name not available from progress data
        totalPoints,
        modulesCompleted: 0,
        badgesEarned: stats.badgeCount,
        rank: 0,
      });
    }

    // Sort by points descending
    entries.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Find current user's entry
    const currentUser = entries.find((e) => e.visitorId === auth.userId);

    // Return top 10 + current user
    const top10 = entries.slice(0, 10);

    return NextResponse.json({
      leaderboard: top10,
      currentUser: currentUser ?? {
        visitorId: auth.userId,
        displayName: auth.userId,
        totalPoints: 0,
        modulesCompleted: 0,
        badgesEarned: 0,
        rank: entries.length + 1,
      },
      totalUsers: entries.length,
    });
  } catch (error) {
    console.error("[LEADERBOARD] Failed to fetch leaderboard:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
