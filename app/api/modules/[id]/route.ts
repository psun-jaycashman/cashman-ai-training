import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getModuleProgress } from "@/lib/data-api-client";
import { getModule } from "@/lib/module-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/modules/[id]
 *
 * Returns a single module with full lesson content and per-lesson completion status.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const mod = getModule(id);
    if (!mod) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    const documentIds = await ensureDataDocuments(auth.apiToken);
    const progress = await getModuleProgress(
      auth.apiToken,
      documentIds.progress,
      auth.userId,
      id
    );

    // Build per-lesson progress map
    const lessonProgress: Record<string, { completed: boolean; completedAt?: string }> = {};
    for (const lesson of mod.lessons) {
      const entry = progress.find((p) => p.lessonId === lesson.id);
      lessonProgress[lesson.id] = {
        completed: entry?.completed ?? false,
        completedAt: entry?.completedAt,
      };
    }

    return NextResponse.json({ module: mod, lessonProgress });
  } catch (error) {
    console.error("[MODULES] Failed to fetch module:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch module",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
