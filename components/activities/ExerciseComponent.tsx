'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PenLine, CheckCircle2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import type { Exercise } from '@/lib/types';

interface ExerciseComponentProps {
  exercise: Exercise;
  onComplete: (response: string) => void;
  isSubmitting?: boolean;
}

export default function ExerciseComponent({ exercise, onComplete, isSubmitting = false }: ExerciseComponentProps) {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const handleSubmit = () => {
    if (!response.trim()) return;
    setSubmitted(true);
    onComplete(response);
  };

  const submitLabel =
    exercise.variant === 'article-reflection' ? 'Submit Reflection' : 'Submit Response';

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
      {exercise.variant === 'prompt-challenge' && (
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

      {exercise.variant === 'ai-sandbox' && (
        <Link
          href="/playground"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open AI Playground
        </Link>
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

      {/* Response area */}
      {submitted ? (
        <div className="p-4 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Your response has been submitted successfully.
          </p>
        </div>
      ) : (
        <>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response here..."
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-y"
          />
          <button
            onClick={handleSubmit}
            disabled={!response.trim() || isSubmitting}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </button>
        </>
      )}
    </div>
  );
}
