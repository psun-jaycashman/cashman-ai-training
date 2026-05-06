import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  getUserProgress,
  markLessonComplete,
  getUserBadges,
  getModuleProgress,
} from "@/lib/data-api-client";
import { MODULES, BADGE_DEFINITIONS, getModule } from "@/lib/module-data";
import { evaluateAndAwardBadges } from "@/lib/badge-eval";

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

    // Mark lesson complete
    const progressEntry = await markLessonComplete(
      auth.apiToken,
      documentIds.progress,
      auth.userId,
      moduleId,
      lessonId
    );

    // Check and award badges via the shared evaluator (same logic used by
    // /api/badges so any bug-fix lands in one place).
    const { newBadges } = await evaluateAndAwardBadges(
      auth.apiToken,
      documentIds,
      auth.userId,
    );

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

