import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { getExercise } from "@/lib/activity-data";

const AGENT_API_URL =
  process.env.AGENT_API_URL || process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000";

const EVALUATION_SCHEMA = {
  name: "exercise_evaluation",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["score", "maxScore", "feedback", "passed", "criteriaResults"],
    properties: {
      score: { type: "number", description: "Number of criteria met" },
      maxScore: { type: "number", description: "Total number of criteria" },
      feedback: { type: "string", description: "Overall feedback for the trainee (2-3 sentences, encouraging tone)" },
      passed: { type: "boolean", description: "Whether the trainee met enough criteria to pass" },
      criteriaResults: {
        type: "array",
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["criterion", "met", "comment"],
          properties: {
            criterion: { type: "string", description: "The criterion being evaluated" },
            met: { type: "boolean", description: "Whether this criterion was met" },
            comment: { type: "string", description: "Brief explanation of the evaluation for this criterion" },
          },
        },
      },
    },
  },
};

/**
 * POST /api/activities/evaluate
 *
 * Evaluate a trainee's exercise submission using LLM via agent-api runs/invoke.
 * Body: { exerciseId, userResponse }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "agent-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { exerciseId, userResponse } = body;

    if (!exerciseId || !userResponse) {
      return NextResponse.json(
        { error: "exerciseId and userResponse are required" },
        { status: 400 }
      );
    }

    const exercise = getExercise(exerciseId);
    if (!exercise) {
      return NextResponse.json(
        { error: `Exercise not found: ${exerciseId}` },
        { status: 404 }
      );
    }

    if (!exercise.evaluationRubric) {
      return NextResponse.json(
        { error: `Exercise ${exerciseId} does not have an evaluation rubric` },
        { status: 400 }
      );
    }

    const { criteria, passingScore, systemPrompt } = exercise.evaluationRubric;

    const prompt = `${systemPrompt}

## Exercise
**Title:** ${exercise.title}
**Instructions:** ${exercise.instructions}
${exercise.scenario ? `**Scenario:** ${exercise.scenario}` : ""}

## Evaluation Criteria
${criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

**Passing threshold:** ${passingScore} of ${criteria.length} criteria must be met.

## Trainee's Submission
${userResponse}

---

Evaluate the submission against each criterion. Be fair but thorough. Give encouraging, constructive feedback.`;

    const res = await fetch(`${AGENT_API_URL}/runs/invoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_name: "record-extractor",
        input: { prompt },
        response_schema: EVALUATION_SCHEMA,
        agent_tier: "simple",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[EVALUATE] Agent API error:", res.status, errorText);
      return NextResponse.json(
        { error: "Failed to evaluate submission", details: errorText },
        { status: 502 }
      );
    }

    const result = await res.json();

    if (result.error) {
      console.error("[EVALUATE] Agent returned error:", result.error);
      return NextResponse.json(
        { error: "Evaluation failed", details: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ evaluation: result.output });
  } catch (error) {
    console.error("[EVALUATE] Failed to evaluate submission:", error);
    return NextResponse.json(
      {
        error: "Failed to evaluate submission",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
