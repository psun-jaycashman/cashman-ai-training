import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getAllBadges } from "@/lib/data-api-client";
import { queryRecords } from "@jazzmind/busibox-app";
import { MODULES } from "@/lib/module-data";
import type { UserProgress, QuizScore, AdminUserProgress, BadgeType } from "@/lib/types";

const ADMIN_ROLES = ["admin", "app:cashman-ai-training:admin"];

/**
 * GET /api/progress/admin
 *
 * Admin only. Returns all users' progress.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    // Check admin role
    const isAdmin = auth.roles.some((role) => ADMIN_ROLES.includes(role));
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }

    const documentIds = await ensureDataDocuments(auth.apiToken);

    // Fetch all progress, quiz scores, and badges
    const [progressResult, quizResult, allBadges] = await Promise.all([
      queryRecords<UserProgress>(auth.apiToken, documentIds.progress, {
        orderBy: [{ field: "startedAt", direction: "desc" }],
      }),
      queryRecords<QuizScore & { answers: string }>(auth.apiToken, documentIds.quizScores, {
        orderBy: [{ field: "completedAt", direction: "desc" }],
      }),
      getAllBadges(auth.apiToken, documentIds.badges),
    ]);

    const allProgress = progressResult.records;
    const allQuizScores = quizResult.records;

    // Total lessons across all modules
    const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalModules = MODULES.length;

    // Group data by visitor
    const userMap = new Map<
      string,
      {
        progress: UserProgress[];
        quizScores: Array<QuizScore & { answers: string }>;
        badges: BadgeType[];
      }
    >();

    for (const p of allProgress) {
      if (!userMap.has(p.visitorId)) {
        userMap.set(p.visitorId, { progress: [], quizScores: [], badges: [] });
      }
      userMap.get(p.visitorId)!.progress.push(p);
    }

    for (const q of allQuizScores) {
      if (!userMap.has(q.visitorId)) {
        userMap.set(q.visitorId, { progress: [], quizScores: [], badges: [] });
      }
      userMap.get(q.visitorId)!.quizScores.push(q);
    }

    for (const b of allBadges) {
      if (!userMap.has(b.visitorId)) {
        userMap.set(b.visitorId, { progress: [], quizScores: [], badges: [] });
      }
      userMap.get(b.visitorId)!.badges.push(b.badgeType);
    }

    // Build admin user progress array
    const users: AdminUserProgress[] = [];

    for (const [visitorId, data] of userMap) {
      const completedLessons = new Set(
        data.progress.filter((p) => p.completed).map((p) => `${p.moduleId}:${p.lessonId}`)
      );

      const modulesCompleted = MODULES.filter((mod) =>
        mod.lessons.every((l) => completedLessons.has(`${mod.id}:${l.id}`))
      ).length;

      const quizScoresValues = data.quizScores
        .filter((q) => q.maxScore > 0)
        .map((q) => q.score / q.maxScore);
      const averageQuizScore =
        quizScoresValues.length > 0
          ? quizScoresValues.reduce((a, b) => a + b, 0) / quizScoresValues.length
          : 0;

      // Find most recent activity
      const progressDates = data.progress.map((p) => p.completedAt || p.startedAt);
      const quizDates = data.quizScores.map((q) => q.completedAt);
      const allDates = [...progressDates, ...quizDates].filter(Boolean).sort().reverse();

      users.push({
        visitorId,
        displayName: visitorId, // Visitor ID as display name since we don't store names in progress
        email: "", // Not stored in progress records
        modulesCompleted,
        totalModules,
        lessonsCompleted: completedLessons.size,
        totalLessons,
        averageQuizScore: Math.round(averageQuizScore * 100),
        badges: data.badges,
        lastActivity: allDates[0] || "",
        certificateEarned: data.badges.includes("think-aimpossible"),
      });
    }

    // Sort by lessons completed descending
    users.sort((a, b) => b.lessonsCompleted - a.lessonsCompleted);

    // Calculate per-module stats
    const moduleStats = MODULES.map((mod) => {
      let usersStarted = 0;
      let usersCompleted = 0;
      let totalQuizScores = 0;
      let quizScoreCount = 0;

      for (const [, data] of userMap) {
        const completedInMod = data.progress.filter(
          (p) => p.moduleId === mod.id && p.completed
        ).length;
        if (completedInMod > 0) usersStarted++;
        if (completedInMod >= mod.lessons.length) usersCompleted++;

        const modQuizzes = data.quizScores.filter(
          (q) => q.moduleId === mod.id && q.maxScore > 0
        );
        for (const q of modQuizzes) {
          totalQuizScores += q.score / q.maxScore;
          quizScoreCount++;
        }
      }

      const totalUsers = userMap.size;
      return {
        moduleId: mod.id,
        moduleTitle: mod.title,
        instructor: mod.instructor,
        completionRate: totalUsers > 0 ? Math.round((usersCompleted / totalUsers) * 100) : 0,
        avgQuizScore: quizScoreCount > 0 ? Math.round((totalQuizScores / quizScoreCount) * 100) : 0,
        usersStarted,
        usersCompleted,
      };
    });

    // Calculate company-wide stats
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const activeLast7Days = users.filter((u) => u.lastActivity >= sevenDaysAgo).length;
    const overallCompletionRate = users.length > 0
      ? Math.round(users.reduce((sum, u) => sum + (u.totalLessons > 0 ? (u.lessonsCompleted / u.totalLessons) * 100 : 0), 0) / users.length)
      : 0;
    const overallAvgQuizScore = users.length > 0
      ? Math.round(users.reduce((sum, u) => sum + u.averageQuizScore, 0) / users.length)
      : 0;

    const companyStats = {
      totalUsers: users.length,
      activeLast7Days,
      overallCompletionRate,
      overallAvgQuizScore,
    };

    return NextResponse.json({ users, moduleStats, companyStats });
  } catch (error) {
    console.error("[ADMIN] Failed to fetch admin progress:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch admin progress",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
