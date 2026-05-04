import { NextRequest, NextResponse } from "next/server";
import { getUserEmailFromToken } from "@jazzmind/busibox-app/lib/authz";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { getExercise } from "@/lib/activity-data";
import { ensureDataDocuments } from "@/lib/data-api-client";
import {
  insertSubmission,
  uploadSubmissionToLibrary,
} from "@/lib/submission-data-api";
import { getLesson } from "@/lib/module-data";
import { summarizeWorkbook } from "@/lib/xlsx-summary";

export const runtime = "nodejs";

const AGENT_API_URL =
  process.env.AGENT_API_URL || process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000";

const XLSX_MAX_BYTES = 5 * 1024 * 1024; // 5 MB plenty for a SoV-shaped workbook
const SUBMISSION_MAX_BYTES = 25 * 1024 * 1024; // hard cap on any upload we keep
const SUBMISSION_UPLOAD_TIMEOUT_MS = 60 * 1000;

// Which busibox agent + tier handles the rubric evaluation. Both default to
// the cloud-LLM-backed "simple" record-extractor; set these to whatever
// agent + tier your busibox agent-api has wired to an on-prem model when
// you want grading to stay inside the network.
const EVALUATOR_AGENT_NAME = process.env.EVALUATOR_AGENT_NAME ?? "record-extractor";
const EVALUATOR_AGENT_TIER = (process.env.EVALUATOR_AGENT_TIER ?? "simple") as
  | "simple"
  | "complex"
  | "batch"
  | string;

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
      feedback: {
        type: "string",
        description:
          "Warm, encouraging overall feedback addressed directly to the user as 'you' (never 'the trainee', 'the user', or third-person). 2-3 sentences. Lead with something specific they did well, then name the most important next step in friendly language. Never scold; never list every gap.",
      },
      passed: { type: "boolean", description: "Whether enough criteria were met to pass" },
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
            comment: {
              type: "string",
              description:
                "One short sentence on this specific criterion, addressed to the user as 'you'. If unmet, suggest a concrete fix; if met, briefly affirm what worked. Never use the word 'trainee'.",
            },
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
 *
 * Two body shapes:
 *   - JSON `{ exerciseId, userResponse }` — pasted text
 *   - multipart/form-data with `exerciseId`, optional `userResponse`,
 *     and a `file` (.xlsx). Server parses the workbook into a text summary
 *     of formulas + values and grades that against the rubric.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "agent-api");
    if (auth instanceof NextResponse) return auth;

    const contentType = request.headers.get("content-type") ?? "";
    let exerciseId: string;
    let userResponse: string;
    let pastedTextForRecord = "";
    let uploadedFile: File | null = null;

    if (contentType.startsWith("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
      }
      exerciseId = String(formData.get("exerciseId") ?? "");
      const pastedText = String(formData.get("userResponse") ?? "").trim();
      pastedTextForRecord = pastedText;
      const fileEntry = formData.get("file");
      if (!exerciseId) {
        return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
      }

      if (fileEntry instanceof File) {
        if (fileEntry.size > SUBMISSION_MAX_BYTES) {
          return NextResponse.json(
            { error: `File too large (max ${SUBMISSION_MAX_BYTES / 1024 / 1024} MB)` },
            { status: 413 }
          );
        }
        uploadedFile = fileEntry;
        const lower = fileEntry.name.toLowerCase();
        if (lower.endsWith(".xlsx")) {
          // Parse Excel into a text dump so the evaluator can grade
          // formulas + values, not just the file name.
          if (fileEntry.size > XLSX_MAX_BYTES) {
            return NextResponse.json(
              { error: `Excel file too large to evaluate (max ${XLSX_MAX_BYTES / 1024 / 1024} MB)` },
              { status: 413 }
            );
          }
          let summary: string;
          try {
            const buf = Buffer.from(await fileEntry.arrayBuffer());
            summary = await summarizeWorkbook(buf);
          } catch (err) {
            console.error("[EVALUATE] failed to parse uploaded workbook", err);
            return NextResponse.json(
              { error: "Could not read the uploaded workbook. Make sure it opens in Excel." },
              { status: 422 }
            );
          }
          userResponse = pastedText
            ? `${pastedText}\n\n---\n\n## Uploaded workbook contents\n${summary}`
            : `## Uploaded workbook contents\n${summary}`;
        } else {
          // Non-xlsx (Word, PowerPoint, PDF) — we keep the file for the
          // shared library but the evaluator only sees the user's typed
          // response. The user is told to summarize their work in the
          // text box for these exercise types.
          if (!pastedText) {
            return NextResponse.json(
              {
                error:
                  "Add a short note in the text box describing your submission (the evaluator can't read Word/PowerPoint/PDF directly).",
              },
              { status: 400 }
            );
          }
          userResponse = `${pastedText}\n\n---\n\n_(uploaded ${fileEntry.name} for the shared submissions library; not parsed into this evaluation)_`;
        }
      } else if (pastedText) {
        userResponse = pastedText;
      } else {
        return NextResponse.json(
          { error: "Provide a userResponse or attach a file" },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      exerciseId = body.exerciseId;
      userResponse = body.userResponse;
      pastedTextForRecord = userResponse ?? "";
      if (!exerciseId || !userResponse) {
        return NextResponse.json(
          { error: "exerciseId and userResponse are required" },
          { status: 400 }
        );
      }
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

## The Submission
${userResponse}

---

Evaluate the submission against each criterion. If the submission included an uploaded workbook, the formulas and values are reproduced verbatim under "Uploaded workbook contents" — judge each criterion against those formulas, not against any text that may also have been typed alongside.

**Tone rules — these are non-negotiable:**
- Address the person directly as "you" (never "the trainee", "the user", "they", or third-person).
- Open the \`feedback\` with one specific thing they got right, then name the single most important next step in friendly, supportive language.
- Keep \`feedback\` to 2–3 sentences. Don't enumerate every missing criterion there — that's what \`criteriaResults\` is for.
- In \`criteriaResults[].comment\`, when a criterion isn't met, suggest a concrete fix in one short sentence; when it's met, affirm briefly. Always speak to the person, not about them.
- Never scold, never use the word "trainee", never lecture.`;

    const res = await fetch(`${AGENT_API_URL}/runs/invoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_name: EVALUATOR_AGENT_NAME,
        input: { prompt },
        response_schema: EVALUATION_SCHEMA,
        agent_tier: EVALUATOR_AGENT_TIER,
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

    // Best-effort: push the user's file into the shared submissions
    // library so other PMs can browse it on /submissions. Failure here
    // never fails the evaluation; we just log and continue.
    let submissionRecord: { id: string; fileId: string } | null = null;
    let submissionError: string | null = null;
    const submissionLibraryId = process.env.STUDENT_SUBMISSIONS_LIBRARY_ID;
    if (submissionLibraryId && uploadedFile) {
      try {
        const dataAuth = await requireAuthWithTokenExchange(request, "data-api");
        if (dataAuth instanceof NextResponse) {
          submissionError = "data-api token exchange returned an error response";
        } else {
          const uploaderEmail = getUserEmailFromToken(dataAuth.apiToken)
            ?? (dataAuth.ssoToken ? getUserEmailFromToken(dataAuth.ssoToken) : null)
            ?? undefined;
          const lesson = getLesson(exercise.moduleId, exercise.lessonId);
          const uploaded = await uploadSubmissionToLibrary(
            uploadedFile,
            submissionLibraryId,
            {
              accessToken: dataAuth.apiToken,
              userId: dataAuth.userId,
              timeout: SUBMISSION_UPLOAD_TIMEOUT_MS,
            },
          );
          const ids = await ensureDataDocuments(dataAuth.apiToken);
          // Trim the user's text to a short excerpt so the listing UI
          // stays readable. Full text already lives in activity-responses.
          const excerpt = pastedTextForRecord.length > 360
            ? pastedTextForRecord.slice(0, 360).trimEnd() + "…"
            : pastedTextForRecord;
          const inserted = await insertSubmission(dataAuth.apiToken, ids.submissionFiles, {
            moduleId: exercise.moduleId,
            lessonId: exercise.lessonId,
            exerciseId: exercise.id,
            lessonTitle: lesson?.title,
            fileName: uploadedFile.name,
            fileId: uploaded.fileId,
            mimeType: uploaded.mimeType,
            sizeBytes: uploaded.sizeBytes,
            responseExcerpt: excerpt || undefined,
            uploaderUserId: dataAuth.userId,
            uploaderEmail,
          });
          submissionRecord = { id: inserted.id, fileId: inserted.fileId };
        }
      } catch (err) {
        console.error("[EVALUATE] shared-library upload failed (non-fatal)", err);
        submissionError = err instanceof Error ? err.message : String(err);
      }
    }

    return NextResponse.json({
      evaluation: result.output,
      submission: submissionRecord,
      submissionError: submissionError ?? undefined,
      submissionLibraryConfigured: !!submissionLibraryId,
    });
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
