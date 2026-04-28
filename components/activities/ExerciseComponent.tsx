'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import type { Exercise, EvaluationResult } from '@/lib/types';

interface ExerciseComponentProps {
  exercise: Exercise;
  onComplete: (response: string) => void;
  isSubmitting?: boolean;
}

export default function ExerciseComponent({ exercise, onComplete, isSubmitting = false }: ExerciseComponentProps) {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [activeExample, setActiveExample] = useState(0);

  const hasRubric = !!exercise.evaluationRubric;
  const hasGoodExamples = !!exercise.goodExamples && exercise.goodExamples.length > 0;

  const handleSubmit = async () => {
    if (!response.trim()) return;

    if (hasRubric) {
      setEvaluating(true);
      setEvalError(null);
      try {
        const res = await fetch('/api/activities/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: exercise.id,
            userResponse: response,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Evaluation failed' }));
          throw new Error(err.error || 'Evaluation failed');
        }

        const data = await res.json();
        setEvaluation(data.evaluation);
        setSubmitted(true);
        if (hasGoodExamples) {
          setActiveExample(0);
          setShowExamples(true);
        }
        onComplete(response);
      } catch (err) {
        setEvalError(err instanceof Error ? err.message : 'Failed to evaluate. Try again.');
        setSubmitted(true);
        if (hasGoodExamples) {
          setActiveExample(0);
          setShowExamples(true);
        }
        onComplete(response);
      } finally {
        setEvaluating(false);
      }
    } else {
      setSubmitted(true);
      if (hasGoodExamples) {
        setActiveExample(0);
        setShowExamples(true);
      }
      onComplete(response);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setEvaluation(null);
    setEvalError(null);
    setShowExamples(false);
  };

  const submitLabel =
    exercise.variant === 'article-reflection'
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
                    {evaluation.passed ? 'Passed!' : 'Not quite -- try again'}
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
                {hasGoodExamples && (
                  <button
                    onClick={() => {
                      setActiveExample(0);
                      setShowExamples(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    View Good Examples
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
                    Submitted, but evaluation unavailable
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    {evalError}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasGoodExamples && (
                  <button
                    onClick={() => {
                      setActiveExample(0);
                      setShowExamples(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    View Good Examples
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
              {hasGoodExamples && (
                <button
                  onClick={() => {
                    setActiveExample(0);
                    setShowExamples(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  View Good Examples
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Paste your result here..."
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-y"
          />
          <button
            onClick={handleSubmit}
            disabled={!response.trim() || isSubmitting || evaluating}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {evaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : isSubmitting ? (
              'Submitting...'
            ) : (
              submitLabel
            )}
          </button>
        </>
      )}

      {/* Good Examples Modal */}
      {showExamples && hasGoodExamples && exercise.goodExamples && (
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
                    Good examples to compare against
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    These aren't the only "right" answers -- they're a few approaches that work well for this prompt.
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

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 px-5 pt-4">
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-800 dark:text-gray-200 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/40">
                {exercise.goodExamples[activeExample].body}
              </pre>
              {exercise.goodExamples[activeExample].note && (
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Why this works: </span>
                  {exercise.goodExamples[activeExample].note}
                </div>
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
