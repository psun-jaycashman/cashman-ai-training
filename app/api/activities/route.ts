import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments,
  saveActivityResponse,
  getAllActivityResponses,
  mirrorSurveyResponse,
} from "@/lib/data-api-client";

/**
 * POST /api/activities
 *
 * Save an activity response (exercise, game, or survey).
 * Body: { moduleId, lessonId, activityType, activityId, response }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { moduleId, lessonId, activityType, activityId, response } = body;

    if (!moduleId || !lessonId || !activityType || !activityId) {
      return NextResponse.json(
        { error: "moduleId, lessonId, activityType, and activityId are required" },
        { status: 400 }
      );
    }

    const documentIds = await ensureDataDocuments(auth.apiToken);

    const result = await saveActivityResponse(
      auth.apiToken,
      documentIds.activityResponses,
      {
        visitorId: auth.userId,
        moduleId,
        lessonId,
        activityType,
        activityId,
        response: response || {},
      }
    );

    // Surveys are mirrored to a cross-user readable doc so admins can
    // review answers. Failure of the mirror should not fail the save —
    // the personal copy already succeeded.
    if (activityType === "survey") {
      try {
        await mirrorSurveyResponse(auth.apiToken, documentIds.surveyResponses, {
          visitorId: auth.userId,
          moduleId,
          lessonId,
          activityId,
          response: response || {},
        });
      } catch (err) {
        console.error("[ACTIVITIES] survey mirror failed (non-fatal)", err);
      }
    }

    return NextResponse.json({ success: true, activityResponse: result });
  } catch (error) {
    console.error("[ACTIVITIES] Failed to save activity:", error);
    return NextResponse.json(
      {
        error: "Failed to save activity response",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/activities
 *
 * Retrieve all activity responses. Admin-only for all users, otherwise returns current user's responses.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const documentIds = await ensureDataDocuments(auth.apiToken);
    const responses = await getAllActivityResponses(
      auth.apiToken,
      documentIds.activityResponses
    );

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("[ACTIVITIES] Failed to fetch activities:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activity responses",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
