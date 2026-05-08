import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  saveQuizScore,
  getUserQuizScores,
} from "@/lib/data-api-client";
import { getQuiz } from "@/lib/module-data";
import { generateId, getNow } from "@jazzmind/busibox-app";
import { evaluateAndAwardBadges } from "@/lib/badge-eval";

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

    // Run the shared badge evaluator so the quiz can also unlock badges that
    // depend on lesson completion (first-steps, module-completion, etc.) — not
    // just perfect-score. Idempotent; already-earned badges are skipped.
    const { newBadges } = await evaluateAndAwardBadges(
      auth.apiToken,
      documentIds,
      auth.userId,
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
