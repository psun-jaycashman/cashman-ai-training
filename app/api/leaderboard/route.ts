import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  listTrainingUsers,
} from "@/lib/data-api-client";
import { displayNameFromEmail } from "@/lib/display-name";
import { queryRecords } from "@jazzmind/busibox-app";
import { computeEarnedBadges } from "@/lib/badge-eval";
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

    // Fetch cross-user-readable progress and the roster. Badges are
    // computed per-user from progress (quiz-derived badges aren't
    // counted here because quiz scores stay personal-scoped).
    const [progressResult, allUsers] = await Promise.all([
      queryRecords<UserProgress>(auth.apiToken, documentIds.progress, {
        orderBy: [{ field: "startedAt", direction: "desc" }],
      }),
      listTrainingUsers(auth.apiToken, documentIds.trainingUsers),
    ]);

    // Roster — every user who has ever loaded the app shows up here.
    const visitorStats = new Map<
      string,
      { lessonsCompleted: number; badgeCount: number; displayName: string | null }
    >();
    function getStats(visitorId: string) {
      if (!visitorStats.has(visitorId)) {
        visitorStats.set(visitorId, {
          lessonsCompleted: 0,
          badgeCount: 0,
          displayName: null,
        });
      }
      return visitorStats.get(visitorId)!;
    }

    // Seed with the user roster so users with 0 lessons + 0 badges still
    // appear on the leaderboard.
    for (const u of allUsers) {
      const slot = getStats(u.visitorId);
      slot.displayName =
        u.displayName ?? displayNameFromEmail(u.email) ?? null;
    }

    // Group progress by visitor, count unique completed lessons, and
    // compute progress-derived badges per user (quizScores omitted on
    // purpose — they're per-user-scoped).
    const progressByVisitor = new Map<string, UserProgress[]>();
    for (const p of progressResult.records) {
      if (!progressByVisitor.has(p.visitorId)) {
        progressByVisitor.set(p.visitorId, []);
      }
      progressByVisitor.get(p.visitorId)!.push(p);
    }
    for (const [visitorId, rows] of progressByVisitor) {
      const completed = new Set(
        rows.filter((p) => p.completed).map((p) => `${p.moduleId}:${p.lessonId}`),
      );
      const stats = getStats(visitorId);
      stats.lessonsCompleted = completed.size;
      stats.badgeCount = computeEarnedBadges({
        visitorId,
        progress: rows,
      }).length;
    }

    // Build entries.
    const entries: LeaderboardEntry[] = [];
    for (const [visitorId, stats] of visitorStats) {
      const totalPoints =
        stats.lessonsCompleted * 10 + stats.badgeCount * 25;
      entries.push({
        visitorId,
        // Stored display name wins; fall back to visitorId so the row is
        // never empty. The page also patches its own row with the live
        // session email if the roster lookup hasn't caught up yet.
        displayName: stats.displayName ?? visitorId,
        totalPoints,
        modulesCompleted: 0,
        badgesEarned: stats.badgeCount,
        rank: 0,
      });
    }

    // Sort by points desc, name asc as tiebreak so 0-point users have a
    // stable order instead of jumping each refresh.
    entries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.displayName.localeCompare(b.displayName);
    });
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const currentUser = entries.find((e) => e.visitorId === auth.userId);

    return NextResponse.json({
      leaderboard: entries,
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
