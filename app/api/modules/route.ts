import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getUserProgress } from "@/lib/data-api-client";
import { MODULES } from "@/lib/module-data";

/**
 * GET /api/modules
 *
 * Returns all modules with the current user's progress for each.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);
    const progress = await getUserProgress(auth.apiToken, documentIds.progress, auth.userId);

    // Build a set of completed lesson IDs
    const completedLessons = new Set(
      progress.filter((p) => p.completed).map((p) => `${p.moduleId}:${p.lessonId}`)
    );

    const modules = MODULES.map((mod) => {
      const totalLessons = mod.lessons.length;
      const completedCount = mod.lessons.filter((lesson) =>
        completedLessons.has(`${mod.id}:${lesson.id}`)
      ).length;

      return {
        ...mod,
        completedLessons: completedCount,
        totalLessons,
      };
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("[MODULES] Failed to fetch modules:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch modules",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
