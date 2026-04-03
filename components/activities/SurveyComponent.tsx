'use client';

import { useState } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import type { Survey, SurveyQuestion } from '@/lib/types';

interface SurveyComponentProps {
  survey: Survey;
  onComplete: (answers: Record<string, string | number>) => void;
  isSubmitting?: boolean;
}

const RATING_EMOJIS = ['😣', '😕', '😐', '🙂', '😄'];
const RATING_LABELS = ['Not confident', 'Slightly', 'Somewhat', 'Confident', 'Very confident'];
const CATEGORY_TITLES: Record<string, string> = {
  'self-assessment': 'Self-Assessment',
  feedback: 'Training Feedback',
};

export default function SurveyComponent({ survey, onComplete, isSubmitting }: SurveyComponentProps) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const grouped = survey.questions.reduce<Record<string, SurveyQuestion[]>>((acc, q) => {
    (acc[q.category] ??= []).push(q);
    return acc;
  }, {});

  const categories = ['self-assessment', 'feedback'].filter(c => grouped[c]);

  const requiredIds = survey.questions
    .filter(q => q.type !== 'text')
    .map(q => q.id);
  const allAnswered = requiredIds.every(id => answers[id] !== undefined);

  const setAnswer = (id: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    onComplete(answers);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thank You!</h3>
        </div>
        <div className="p-6 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-center space-y-2">
          <p className="text-sm font-medium">Your responses have been recorded.</p>
          <p className="text-sm opacity-80">Thanks for sharing your feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <ClipboardList className="w-4 h-4" />
        </span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{survey.title}</h3>
      </div>

      {categories.map(cat => (
        <div key={cat} className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {CATEGORY_TITLES[cat]}
            </h4>
          </div>

          {grouped[cat].map(q => (
            <div key={q.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{q.question}</p>

              {q.type === 'rating' && (
                <div className="flex gap-2">
                  {RATING_EMOJIS.map((emoji, i) => {
                    const val = i + 1;
                    const selected = answers[q.id] === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setAnswer(q.id, val)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition-all ${
                          selected
                            ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-600'
                        }`}
                      >
                        <span className="text-lg">{emoji}</span>
                        <span className="whitespace-nowrap">{RATING_LABELS[i]}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === 'text' && (
                <textarea
                  rows={3}
                  placeholder="Your thoughts (optional)..."
                  value={(answers[q.id] as string) ?? ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 resize-none"
                />
              )}

              {q.type === 'multiple-choice' && q.options && (
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setAnswer(q.id, opt)}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-center gap-3 ${
                          selected
                            ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-500'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          selected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selected && <span className="block w-full h-full rounded-full bg-white scale-[0.4]" />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || isSubmitting}
        className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Survey'}
      </button>
    </div>
  );
}
