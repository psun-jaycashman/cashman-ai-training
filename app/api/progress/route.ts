import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  getUserProgress,
  getUserQuizScores,
  markLessonComplete,
} from "@/lib/data-api-client";
import { MODULES, getModule } from "@/lib/module-data";
import { computeEarnedBadges, diffBadges } from "@/lib/badge-eval";
import type { UserProgress } from "@/lib/types";

/**
 * GET /api/progress
 *
 * Returns the current user's full progress summary.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);
    const progress = await getUserProgress(auth.apiToken, documentIds.progress, auth.userId);

    const completedSet = new Set(
      progress.filter((p) => p.completed).map((p) => `${p.moduleId}:${p.lessonId}`)
    );

    const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalCompleted = completedSet.size;

    const moduleProgress: Record<string, { completed: number; total: number }> = {};
    for (const mod of MODULES) {
      const completed = mod.lessons.filter((l) =>
        completedSet.has(`${mod.id}:${l.id}`)
      ).length;
      moduleProgress[mod.id] = { completed, total: mod.lessons.length };
    }

    return NextResponse.json({ progress, totalCompleted, totalLessons, moduleProgress });
  } catch (error) {
    console.error("[PROGRESS] Failed to fetch progress:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch progress",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress
 *
 * Mark a lesson as complete. Body: { moduleId, lessonId }
 * Also checks and awards any newly earned badges.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { moduleId, lessonId } = body;

    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json(
        { error: "moduleId is required" },
        { status: 400 }
      );
    }
    if (!lessonId || typeof lessonId !== "string") {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    // Validate module and lesson exist
    const mod = getModule(moduleId);
    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const documentIds = await ensureDataDocuments(auth.apiToken);

    // Snapshot pre-mutation badges so we can return a delta. Quiz scores
    // don't change in this endpoint, so we read them once.
    const [progressBefore, quizScores] = await Promise.all([
      getUserProgress(auth.apiToken, documentIds.progress, auth.userId),
      getUserQuizScores(auth.apiToken, documentIds.quizScores, auth.userId),
    ]);
    const before = computeEarnedBadges({
      visitorId: auth.userId,
      progress: progressBefore,
      quizScores,
    });

    // Mark lesson complete
    const progressEntry = await markLessonComplete(
      auth.apiToken,
      documentIds.progress,
      auth.userId,
      moduleId,
      lessonId
    );

    // Recompute against the post-mutation set without a second round-trip:
    // splice the new entry into the snapshot we already have.
    const progressAfter: UserProgress[] = [
      ...progressBefore.filter(
        (p) => !(p.moduleId === moduleId && p.lessonId === lessonId),
      ),
      progressEntry,
    ];
    const after = computeEarnedBadges({
      visitorId: auth.userId,
      progress: progressAfter,
      quizScores,
    });
    const newBadges = diffBadges(before, after);

    return NextResponse.json({
      progress: progressEntry,
      newBadges,
    });
  } catch (error) {
    console.error("[PROGRESS] Failed to mark lesson complete:", error);
    return NextResponse.json(
      {
        error: "Failed to mark lesson complete",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

