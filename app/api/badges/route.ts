import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  getUserBadges,
  awardBadge,
  getUserProgress,
  getUserQuizScores,
} from "@/lib/data-api-client";
import { MODULES, BADGE_DEFINITIONS, getModule } from "@/lib/module-data";
import { generateId, getNow } from "@jazzmind/busibox-app";
import type { Badge, BadgeType } from "@/lib/types";

/**
 * GET /api/badges
 *
 * Returns the current user's earned badges along with all badge definitions.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);
    const earned = await getUserBadges(auth.apiToken, documentIds.badges, auth.userId);

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
 * Check and award any new badges the user has earned.
 * Called after lesson completion or quiz submission.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const token = auth.apiToken;
    const userId = auth.userId;
    const documentIds = await ensureDataDocuments(token);

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

    function isModuleComplete(modId: string): boolean {
      const mod = getModule(modId);
      if (!mod) return false;
      return mod.lessons.every((l) => completedSet.has(`${modId}:${l.id}`));
    }

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

    // power-user: all Module 8 lessons completed
    if (isModuleComplete("mod-8")) {
      await tryAward("power-user");
    }

    // perfect-score: any quiz with 100%
    const hasPerfect = quizScores.some((s) => s.score === s.maxScore && s.maxScore > 0);
    if (hasPerfect) {
      await tryAward("perfect-score");
    }

    // completionist: all required (non-bonus) modules fully completed
    const requiredModules = MODULES.filter((m) => !m.isBonus);
    const allRequiredComplete = requiredModules.every((m) =>
      isModuleComplete(m.id)
    );
    if (allRequiredComplete) {
      await tryAward("completionist");
    }

    // think-aimpossible: >= 95% of *required* lessons complete + final assessment >= 80%.
    // Bonus module lessons don't count toward the threshold or denominator.
    const requiredLessons = requiredModules.flatMap((m) =>
      m.lessons.map((l) => `${m.id}:${l.id}`)
    );
    const completedRequired = requiredLessons.filter((key) =>
      completedSet.has(key)
    ).length;
    if (
      requiredLessons.length > 0 &&
      completedRequired / requiredLessons.length >= 0.95
    ) {
      const finalQuiz = quizScores.find(
        (s) => s.quizId === "quiz-final" && s.maxScore > 0
      );
      if (finalQuiz && finalQuiz.score / finalQuiz.maxScore >= 0.8) {
        await tryAward("think-aimpossible");
      }
    }

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
