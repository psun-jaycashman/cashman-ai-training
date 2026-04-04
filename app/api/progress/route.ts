import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  getUserProgress,
  markLessonComplete,
  getUserBadges,
  awardBadge,
  getModuleProgress,
  getUserQuizScores,
} from "@/lib/data-api-client";
import { MODULES, BADGE_DEFINITIONS, getModule } from "@/lib/module-data";
import { generateId, getNow } from "@jazzmind/busibox-app";
import type { Badge, BadgeType } from "@/lib/types";

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

    // Check and award badges
    const newBadges = await checkAndAwardBadges(
      auth.apiToken,
      documentIds,
      auth.userId
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

/**
 * Check all badge conditions and award any newly earned badges.
 */
async function checkAndAwardBadges(
  token: string,
  documentIds: { progress: string; quizScores: string; badges: string },
  userId: string
): Promise<Badge[]> {
  const [allProgress, existingBadges, quizScores] = await Promise.all([
    getUserProgress(token, documentIds.progress, userId),
    getUserBadges(token, documentIds.badges, userId),
    getUserQuizScores(token, documentIds.quizScores, userId),
  ]);

  const completedSet = new Set(
    allProgress.filter((p) => p.completed).map((p) => `${p.moduleId}:${p.lessonId}`)
  );
  const earnedTypes = new Set(existingBadges.map((b) => b.badgeType));
  const newBadges: Badge[] = [];

  const totalCompleted = completedSet.size;

  // Helper: check if all lessons in a module are complete
  function isModuleComplete(modId: string): boolean {
    const mod = getModule(modId);
    if (!mod) return false;
    return mod.lessons.every((l) => completedSet.has(`${modId}:${l.id}`));
  }

  // Helper: award a badge if not already earned
  async function tryAward(badgeType: BadgeType, metadata: Record<string, unknown> = {}): Promise<void> {
    if (earnedTypes.has(badgeType)) return;
    const badge: Badge = {
      id: generateId(),
      visitorId: userId,
      badgeType,
      earnedAt: getNow(),
      metadata,
    };
    const awarded = await awardBadge(token, documentIds.badges, badge);
    newBadges.push(awarded);
    earnedTypes.add(badgeType);
  }

  // first-steps: any 1 lesson completed
  if (totalCompleted >= 1) {
    await tryAward("first-steps");
  }

  // email-ace: all Module 2 lessons completed
  if (isModuleComplete("mod-2")) {
    await tryAward("email-ace");
  }

  // report-writer: all Module 3 lessons completed
  if (isModuleComplete("mod-3")) {
    await tryAward("report-writer");
  }

  // data-wrangler: all Module 4 lessons completed
  if (isModuleComplete("mod-4")) {
    await tryAward("data-wrangler");
  }

  // media-maker: all Module 5 lessons completed
  if (isModuleComplete("mod-5")) {
    await tryAward("media-maker");
  }

  // search-pro: all Module 6 lessons completed
  if (isModuleComplete("mod-6")) {
    await tryAward("search-pro");
  }

  // agent-handler: all Module 7 lessons completed
  if (isModuleComplete("mod-7")) {
    await tryAward("agent-handler");
  }

  // power-user: all Module 8 lessons completed
  if (isModuleComplete("mod-8")) {
    await tryAward("power-user");
  }

  // perfect-score: any quiz with 100%
  const hasPerfect = quizScores.some((s) => s.score === s.maxScore && s.maxScore > 0);
  if (hasPerfect) {
    await tryAward("perfect-score");
  }

  // completionist: all 8 modules fully completed
  const allModulesComplete = MODULES.every((m) => isModuleComplete(m.id));
  if (allModulesComplete) {
    await tryAward("completionist");
  }

  // think-aimpossible: all modules complete + final assessment >= 80%
  if (allModulesComplete) {
    const finalQuiz = quizScores.find(
      (s) => s.quizId === "quiz-final" && s.maxScore > 0
    );
    if (finalQuiz && finalQuiz.score / finalQuiz.maxScore >= 0.8) {
      await tryAward("think-aimpossible");
    }
  }

  return newBadges;
}
