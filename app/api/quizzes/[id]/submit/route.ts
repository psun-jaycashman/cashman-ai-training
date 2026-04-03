import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  saveQuizScore,
  getUserQuizScores,
  getUserBadges,
  awardBadge,
  getUserProgress,
} from "@/lib/data-api-client";
import { getQuiz, MODULES, getModule } from "@/lib/module-data";
import { generateId, getNow } from "@jazzmind/busibox-app";
import type { Badge, BadgeType } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/quizzes/[id]/submit
 *
 * Submit quiz answers. Body: { answers: Record<questionId, number | number[]> }
 * Scores the quiz and returns results.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: quizId } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const quiz = getQuiz(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { answers } = body as { answers?: Record<string, number | number[]> };

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "answers is required and must be an object" },
        { status: 400 }
      );
    }

    // Score the quiz
    let score = 0;
    const maxScore = quiz.questions.length;
    const results: Array<{
      questionId: string;
      correct: boolean;
      correctAnswer: number | number[];
      explanation: string;
    }> = [];

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      let correct = false;

      if (Array.isArray(question.correctAnswer)) {
        // Multi-select: both must match exactly
        if (Array.isArray(userAnswer)) {
          const sortedCorrect = [...question.correctAnswer].sort();
          const sortedUser = [...userAnswer].sort();
          correct =
            sortedCorrect.length === sortedUser.length &&
            sortedCorrect.every((v, i) => v === sortedUser[i]);
        }
      } else {
        // Single answer
        correct = userAnswer === question.correctAnswer;
      }

      if (correct) score++;

      results.push({
        questionId: question.id,
        correct,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
    }

    const passed = score >= Math.ceil(maxScore * 0.7); // 70% to pass

    const documentIds = await ensureDataDocuments(auth.apiToken);

    // Get existing scores to determine attempt count
    const existingScores = await getUserQuizScores(
      auth.apiToken,
      documentIds.quizScores,
      auth.userId
    );
    const previousAttempt = existingScores.find((s) => s.quizId === quizId);
    const attempts = (previousAttempt?.attempts ?? 0) + 1;

    // Save score
    await saveQuizScore(auth.apiToken, documentIds.quizScores, {
      id: previousAttempt?.id ?? generateId(),
      visitorId: auth.userId,
      moduleId: quiz.moduleId,
      lessonId: quiz.lessonId,
      quizId,
      score,
      maxScore,
      attempts,
      completedAt: getNow(),
      answers,
    });

    // Check for perfect-score badge and other quiz-related badges
    const newBadges = await checkQuizBadges(
      auth.apiToken,
      documentIds,
      auth.userId,
      score,
      maxScore
    );

    return NextResponse.json({
      score,
      maxScore,
      passed,
      results,
      attempts,
      newBadges,
    });
  } catch (error) {
    console.error("[QUIZ] Failed to submit quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to submit quiz",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Check for quiz-related badges after submission.
 */
async function checkQuizBadges(
  token: string,
  documentIds: { progress: string; quizScores: string; badges: string },
  userId: string,
  latestScore: number,
  latestMaxScore: number
): Promise<Badge[]> {
  const existingBadges = await getUserBadges(token, documentIds.badges, userId);
  const earnedTypes = new Set(existingBadges.map((b) => b.badgeType));
  const newBadges: Badge[] = [];

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

  // perfect-score: any quiz with 100%
  if (latestScore === latestMaxScore && latestMaxScore > 0) {
    await tryAward("perfect-score");
  }

  // think-aimpossible: all modules complete + final assessment >= 80%
  if (!earnedTypes.has("think-aimpossible")) {
    const [allProgress, allQuizScores] = await Promise.all([
      getUserProgress(token, documentIds.progress, userId),
      getUserQuizScores(token, documentIds.quizScores, userId),
    ]);

    const completedSet = new Set(
      allProgress.filter((p) => p.completed).map((p) => `${p.moduleId}:${p.lessonId}`)
    );

    const allModulesComplete = MODULES.every((mod) => {
      const m = getModule(mod.id);
      return m && m.lessons.every((l) => completedSet.has(`${mod.id}:${l.id}`));
    });

    if (allModulesComplete) {
      const finalQuiz = allQuizScores.find(
        (s) => s.moduleId === "mod-9" && s.maxScore > 0
      );
      if (finalQuiz && finalQuiz.score / finalQuiz.maxScore >= 0.8) {
        await tryAward("think-aimpossible");
      }
    }
  }

  return newBadges;
}
