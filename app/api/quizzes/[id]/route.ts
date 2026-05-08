import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { getQuiz } from "@/lib/module-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/quizzes/[id]
 *
 * Returns a single quiz by ID. The QuizComponent shows immediate per-question
 * feedback after submit, so it needs correctAnswer/explanation client-side.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const quiz = getQuiz(id);
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("[QUIZZES] Failed to fetch quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch quiz",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
