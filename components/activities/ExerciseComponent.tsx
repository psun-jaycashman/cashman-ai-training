'use client';

import { useRef, useState } from 'react';
import {
  PenLine,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  RotateCcw,
  Loader2,
  Lightbulb,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Send,
  Bold,
  Italic,
  Underline,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  FileText,
} from 'lucide-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
import type { Exercise, EvaluationResult } from '@/lib/types';

interface ExerciseComponentProps {
  exercise: Exercise;
  onComplete: (response: string) => void;
  isSubmitting?: boolean;
}

// HTML <font size> ranges 1..7; default 3 = ~13px in our composer.
const EDITOR_FONT_SIZES = [1, 2, 3, 4, 5, 6, 7] as const;
type FontSizeStep = (typeof EDITOR_FONT_SIZES)[number];

const WORD_FONT_CHOICES: Array<{ label: string; family: string }> = [
  { label: 'Calibri', family: 'Calibri, "Segoe UI", system-ui, sans-serif' },
  { label: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { label: 'Times New Roman', family: '"Times New Roman", Times, serif' },
  { label: 'Georgia', family: 'Georgia, "Times New Roman", serif' },
  { label: 'Cambria', family: 'Cambria, Georgia, serif' },
];

export default function ExerciseComponent({ exercise, onComplete, isSubmitting = false }: ExerciseComponentProps) {
  const [response, setResponse] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [editorBody, setEditorBody] = useState('');
  const [editorFontSize, setEditorFontSize] = useState<FontSizeStep>(3);
  const [editorFontFamily, setEditorFontFamily] = useState<string>(WORD_FONT_CHOICES[0].family);
  const editorBodyRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [activeExample, setActiveExample] = useState(0);

  const hasRubric = !!exercise.evaluationRubric;
  const hasGoodExamples = !!exercise.goodExamples && exercise.goodExamples.length > 0;
  const hasHints = !!exercise.hints && exercise.hints.length > 0;
  const hasAnswerKey = !!exercise.answerKey;
  const hasFeedbackPanel = hasGoodExamples || hasHints || hasAnswerKey;
  const acceptedFileTypes = exercise.acceptedFileTypes ?? [];
  const acceptsFile = acceptedFileTypes.length > 0;
  const acceptAttr = acceptedFileTypes.join(',');
  const emailMode = !!exercise.emailCompose;
  const wordMode = !!exercise.wordCompose;
  const richEditorMode = emailMode || wordMode;
  const feedbackPanelLabel =
    hasGoodExamples && hasHints
      ? 'View Hints & Examples'
      : hasHints
        ? 'View Hints'
        : hasGoodExamples
          ? 'View Good Examples'
          : 'View Answer Key';

  // Email mode submits Subject + body; Word mode submits the body directly;
  // textarea modes use the typed `response`. The submission is always plain
  // text so the rubric evaluator continues to operate on a single block.
  const composedEmail = emailMode
    ? `Subject: ${emailSubject.trim()}\n\n${editorBody.trim()}`.trim()
    : '';
  const submissionText = emailMode
    ? composedEmail
    : wordMode
      ? editorBody
      : response;
  const canSubmit = emailMode
    ? emailSubject.trim().length > 0 && editorBody.trim().length > 0
    : wordMode
      ? editorBody.trim().length > 0
      : file !== null || response.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const completionText = richEditorMode
      ? submissionText
      : response.trim() || (file ? `[uploaded: ${file.name}]` : '');

    if (hasRubric) {
      setEvaluating(true);
      setEvalError(null);
      try {
        let res: Response;
        if (file && !richEditorMode) {
          const fd = new FormData();
          fd.append('exerciseId', exercise.id);
          fd.append('file', file);
          if (response.trim()) fd.append('userResponse', response);
          res = await fetch('/api/activities/evaluate', { method: 'POST', body: fd });
        } else {
          res = await fetch('/api/activities/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exerciseId: exercise.id,
              userResponse: richEditorMode ? submissionText : response,
            }),
          });
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Evaluation failed' }));
          throw new Error(err.error || 'Evaluation failed');
        }

        const data = await res.json();
        setEvaluation(data.evaluation);
        setSubmitted(true);
        if (hasFeedbackPanel) {
          setActiveExample(0);
          setShowExamples(true);
        }
        // For tracking, persist either the typed text or a stub describing the
        // upload so the activity record carries something meaningful.
        onComplete(completionText);
      } catch (err) {
        setEvalError(err instanceof Error ? err.message : 'Failed to evaluate. Try again.');
        setSubmitted(true);
        if (hasFeedbackPanel) {
          setActiveExample(0);
          setShowExamples(true);
        }
        onComplete(completionText);
      } finally {
        setEvaluating(false);
      }
    } else {
      setSubmitted(true);
      if (hasFeedbackPanel) {
        setActiveExample(0);
        setShowExamples(true);
      }
      onComplete(completionText);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setEvaluation(null);
    setEvalError(null);
    setShowExamples(false);
    setFile(null);
  };

  // execCommand is deprecated but still the simplest way to do
  // selection-based rich-text formatting without a heavy editor dep.
  // Each handler keeps focus inside the editable div so the selection
  // (and therefore the formatting target) is preserved.
  const runEditorCommand = (command: string, value?: string) => {
    const el = editorBodyRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, value);
    setEditorBody(el.innerText);
  };

  const adjustEditorFontSize = (delta: 1 | -1) => {
    const next = Math.min(7, Math.max(1, editorFontSize + delta)) as FontSizeStep;
    if (next === editorFontSize) return;
    setEditorFontSize(next);
    runEditorCommand('fontSize', String(next));
  };

  const setEditorFontFamilyAndApply = (family: string) => {
    setEditorFontFamily(family);
    runEditorCommand('fontName', family);
  };

  const submitLabel = emailMode
    ? 'Send'
    : wordMode
      ? 'Submit Document'
      : exercise.variant === 'article-reflection'
        ? 'Submit Reflection'
        : hasRubric
          ? 'Submit for Evaluation'
          : 'Submit Response';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <PenLine className="w-4 h-4" />
        </span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {exercise.title}
        </h3>
      </div>

      {/* Instructions */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {exercise.instructions}
      </p>

      {/* Variant-specific content */}
      {(exercise.variant === 'prompt-challenge' || exercise.variant === 'paste-back') && (
        <>
          {exercise.scenario && (
            <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">Scenario</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400">{exercise.scenario}</p>
            </div>
          )}

          {exercise.modelAnswer && (
            <div>
              <button
                type="button"
                onClick={() => setShowModelAnswer((v) => !v)}
                className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
              >
                {showModelAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showModelAnswer ? 'Hide Model Answer' : 'Reveal Model Answer'}
              </button>
              {showModelAnswer && (
                <div className="mt-2 p-4 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-green-800 dark:text-green-300">{exercise.modelAnswer}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {exercise.variant === 'article-reflection' && (
        <>
          {exercise.reflectionPrompt && (
            <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
              <p className="text-sm text-indigo-700 dark:text-indigo-400">{exercise.reflectionPrompt}</p>
            </div>
          )}
          {exercise.articleUrl && (
            <a
              href={exercise.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Read Article
            </a>
          )}
        </>
      )}

      {/* Response area / Evaluation results */}
      {submitted ? (
        <div className="space-y-4">
          {/* Evaluation results */}
          {evaluation ? (
            <div className="space-y-4">
              {/* Score banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                evaluation.passed
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
              }`}>
                {evaluation.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-semibold ${
                    evaluation.passed
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {evaluation.passed ? 'Nice work!' : 'Almost there — give it another shot'}
                    {' '}&middot;{' '}
                    {evaluation.score}/{evaluation.maxScore} criteria met
                  </p>
                  <p className={`text-sm mt-1 ${
                    evaluation.passed
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {evaluation.feedback}
                  </p>
                </div>
              </div>

              {/* Per-criterion breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Criteria breakdown
                </p>
                {evaluation.criteriaResults.map((cr, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {cr.met ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-gray-800 dark:text-gray-200">{cr.criterion}</span>
                      {cr.comment && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{cr.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {hasFeedbackPanel && (
                  <button
                    onClick={() => {
                      setActiveExample(0);
                      setShowExamples(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {feedbackPanelLabel}
                  </button>
                )}
                {!evaluation.passed && (
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
              </div>
            </div>
          ) : evalError ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Got your submission — evaluator is taking a moment
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    {evalError}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasFeedbackPanel && (
                  <button
                    onClick={() => {
                      setActiveExample(0);
                      setShowExamples(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {feedbackPanelLabel}
                  </button>
                )}
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Your response has been submitted successfully.
                </p>
              </div>
              {hasFeedbackPanel && (
                <button
                  onClick={() => {
                    setActiveExample(0);
                    setShowExamples(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  {feedbackPanelLabel}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {emailMode && exercise.emailCompose ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              {/* Outlook-style header strip */}
              <div className="px-4 py-2 bg-[#0078d4] text-white text-sm font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  O
                </span>
                New Message
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex items-center gap-3 px-4 py-2 text-sm">
                  <label className="w-14 text-gray-500 dark:text-gray-400 font-medium">From</label>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {exercise.emailCompose.from}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 text-sm">
                  <label className="w-14 text-gray-500 dark:text-gray-400 font-medium">To</label>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                    {exercise.emailCompose.to}
                  </span>
                </div>
                {exercise.emailCompose.cc && (
                  <div className="flex items-center gap-3 px-4 py-2 text-sm">
                    <label className="w-14 text-gray-500 dark:text-gray-400 font-medium">Cc</label>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                      {exercise.emailCompose.cc}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-2 text-sm">
                  <label htmlFor="email-subject" className="w-14 text-gray-500 dark:text-gray-400 font-medium">
                    Subject
                  </label>
                  <input
                    id="email-subject"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder={exercise.emailCompose.subjectPlaceholder ?? 'Subject'}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <FormattingToolbar
                  runCommand={runEditorCommand}
                  fontSize={editorFontSize}
                  onFontSizeChange={adjustEditorFontSize}
                />
                <div className="relative">
                  <div
                    ref={editorBodyRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setEditorBody((e.target as HTMLDivElement).innerText)}
                    className="min-h-[260px] px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none prose-sm max-w-none"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                  {editorBody.trim().length === 0 && (
                    <div className="pointer-events-none absolute top-3 left-4 text-sm text-gray-400 dark:text-gray-500">
                      {exercise.emailCompose.bodyPlaceholder ?? 'Write your message…'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : wordMode && exercise.wordCompose ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 overflow-hidden">
              {/* Word-style title bar */}
              <div className="px-4 py-2 bg-[#185abd] text-white text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="truncate">
                  {exercise.wordCompose.documentTitle ?? 'Document.docx'}
                </span>
                <span className="text-xs opacity-80 ml-1">— Word</span>
              </div>
              <FormattingToolbar
                runCommand={runEditorCommand}
                fontSize={editorFontSize}
                onFontSizeChange={adjustEditorFontSize}
                showBullets
                fontChoices={WORD_FONT_CHOICES}
                fontFamily={editorFontFamily}
                onFontFamilyChange={setEditorFontFamilyAndApply}
              />
              {/* "Page" — white sheet on a gray canvas, like Word's print layout. */}
              <div className="px-6 py-6 sm:px-10 bg-gray-100 dark:bg-gray-900">
                <div className="relative mx-auto max-w-3xl bg-white dark:bg-gray-800 shadow-md rounded-sm border border-gray-200 dark:border-gray-700">
                  <div
                    ref={editorBodyRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setEditorBody((e.target as HTMLDivElement).innerText)}
                    className="min-h-[480px] px-10 py-12 text-[15px] leading-relaxed text-gray-900 dark:text-white focus:outline-none"
                    style={{ whiteSpace: 'pre-wrap', fontFamily: editorFontFamily }}
                  />
                  {editorBody.trim().length === 0 && (
                    <div className="pointer-events-none absolute top-12 left-10 text-[15px] text-gray-400 dark:text-gray-500">
                      {exercise.wordCompose.bodyPlaceholder ?? 'Start typing your document…'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={
                acceptsFile
                  ? 'Paste your formulas here, or use the upload button below to submit your spreadsheet…'
                  : 'Paste your result here...'
              }
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-y"
            />
          )}

          {acceptsFile && !richEditorMode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span>or upload your file</span>
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                  file
                    ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}
              >
                <input
                  type="file"
                  accept={acceptAttr}
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                  }}
                />
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  {file ? <FileSpreadsheet className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  {file ? (
                    <>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB · click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Click to choose a file
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Accepted: {acceptedFileTypes.join(', ')}
                      </p>
                    </>
                  )}
                </div>
                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-1">
                Heads-up: uploaded files are posted to the{' '}
                <a
                  href={`${basePath}/submissions`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Submissions
                </a>{' '}
                tab so other users can browse and download them. Don't upload anything you wouldn't share with the team.
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting || evaluating}
            className={`w-full py-3 px-6 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              emailMode
                ? 'bg-[#0078d4] hover:bg-[#106ebe]'
                : wordMode
                  ? 'bg-[#185abd] hover:bg-[#13478f]'
                  : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {evaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {emailMode
                  ? 'Sending…'
                  : wordMode
                    ? 'Evaluating document…'
                    : file
                      ? 'Parsing & evaluating…'
                      : 'Evaluating...'}
              </>
            ) : isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                {emailMode && <Send className="w-4 h-4" />}
                {wordMode && <FileText className="w-4 h-4" />}
                {submitLabel}
              </>
            )}
          </button>
        </>
      )}

      {/* Hints & Examples Modal */}
      {showExamples && hasFeedbackPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="good-examples-title"
          onClick={() => setShowExamples(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </span>
                <div>
                  <h4 id="good-examples-title" className="text-base font-semibold text-gray-900 dark:text-white">
                    {hasGoodExamples && hasHints
                      ? 'Hints & good examples'
                      : hasHints
                        ? 'Helpful hints'
                        : 'Good examples to compare against'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {hasGoodExamples
                      ? "These aren't the only \"right\" answers — they're a few approaches that work well for this prompt."
                      : 'A few hints to help you sharpen your response.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExamples(false)}
                aria-label="Close"
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body — scrolls when content overflows */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Answer-key download — gated to post-submission so trainees
                  attempt the exercise first. */}
              {exercise.answerKey && (
                <a
                  href={`${basePath}${exercise.answerKey.href}`}
                  download
                  className="flex items-start gap-3 p-4 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{exercise.answerKey.label}</p>
                    {exercise.answerKey.description && (
                      <p className="text-xs mt-0.5 text-emerald-800 dark:text-emerald-300/80">
                        {exercise.answerKey.description}
                      </p>
                    )}
                  </div>
                </a>
              )}

              {hasHints && exercise.hints && (
                <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
                    Helpful hints
                  </p>
                  <ul className="space-y-1.5">
                    {exercise.hints.map((hint, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm text-indigo-900 dark:text-indigo-200"
                      >
                        <span aria-hidden="true" className="flex-shrink-0 mt-0.5 text-indigo-500 dark:text-indigo-400">
                          •
                        </span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasGoodExamples && exercise.goodExamples && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Good examples
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.goodExamples.map((ex, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveExample(i)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            activeExample === i
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {ex.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-800 dark:text-gray-200 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/40">
                    {exercise.goodExamples[activeExample].body}
                  </pre>
                  {exercise.goodExamples[activeExample].note && (
                    <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">Why this works: </span>
                      {exercise.goodExamples[activeExample].note}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowExamples(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FontChoice {
  label: string;
  family: string;
}

interface FormattingToolbarProps {
  runCommand: (command: string, value?: string) => void;
  fontSize: number;
  onFontSizeChange: (delta: 1 | -1) => void;
  showBullets?: boolean;
  fontChoices?: FontChoice[];
  fontFamily?: string;
  onFontFamilyChange?: (family: string) => void;
}

function FormattingToolbar({
  runCommand,
  fontSize,
  onFontSizeChange,
  showBullets = false,
  fontChoices,
  fontFamily,
  onFontFamilyChange,
}: FormattingToolbarProps) {
  const btn =
    'w-8 h-8 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center';
  const sep = 'mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700';
  return (
    <div className="flex items-center flex-wrap gap-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
      {fontChoices && onFontFamilyChange && (
        <>
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            title="Font"
            className="h-8 px-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
            style={{ fontFamily }}
          >
            {fontChoices.map((f) => (
              <option key={f.label} value={f.family} style={{ fontFamily: f.family }}>
                {f.label}
              </option>
            ))}
          </select>
          <span className={sep} />
        </>
      )}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); runCommand('bold'); }}
        title="Bold"
        className={btn}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); runCommand('italic'); }}
        title="Italic"
        className={btn}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); runCommand('underline'); }}
        title="Underline"
        className={btn}
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); runCommand('hiliteColor', '#fde68a'); }}
        title="Highlight"
        className={btn}
      >
        <Highlighter className="w-4 h-4" />
      </button>
      <span className={sep} />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onFontSizeChange(-1); }}
        title="Decrease font size"
        disabled={fontSize <= 1}
        className={`${btn} text-xs font-semibold disabled:opacity-40`}
      >
        A−
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onFontSizeChange(1); }}
        title="Increase font size"
        disabled={fontSize >= 7}
        className={`${btn} text-sm font-semibold disabled:opacity-40`}
      >
        A+
      </button>
      <span className={sep} />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); runCommand('justifyLeft'); }}
        title="Align left"
        className={btn}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); runCommand('justifyCenter'); }}
        title="Align center"
        className={btn}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); runCommand('justifyRight'); }}
        title="Align right"
        className={btn}
      >
        <AlignRight className="w-4 h-4" />
      </button>
      {showBullets && (
        <>
          <span className={sep} />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); runCommand('insertUnorderedList'); }}
            title="Bullet list"
            className={btn}
          >
            <List className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
