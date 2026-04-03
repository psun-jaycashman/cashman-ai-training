'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import type { QuizQuestion } from '@/lib/types';

interface QuizComponentProps {
  questions: QuizQuestion[];
  onSubmit: (answers: Record<string, number | number[]>) => void;
  isSubmitting?: boolean;
}

interface QuizResults {
  score: number;
  maxScore: number;
  perQuestion: {
    questionId: string;
    correct: boolean;
    selectedAnswer: number;
    correctAnswer: number | number[];
    explanation: string;
  }[];
}

export default function QuizComponent({ questions, onSubmit, isSubmitting = false }: QuizComponentProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<QuizResults | null>(null);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (results) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    // Calculate results locally for immediate feedback
    const perQuestion = questions.map((q) => {
      const selected = answers[q.id] ?? -1;
      const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : q.correctAnswer[0];
      return {
        questionId: q.id,
        correct: selected === correctIdx,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      };
    });

    const score = perQuestion.filter((r) => r.correct).length;

    setResults({
      score,
      maxScore: questions.length,
      perQuestion,
    });

    // Also call the parent handler to persist
    onSubmit(answers);
  };

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="space-y-8">
      {questions.map((question, qIndex) => {
        const questionResult = results?.perQuestion.find((r) => r.questionId === question.id);

        return (
          <div
            key={question.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border p-6 ${
              questionResult
                ? questionResult.correct
                  ? 'border-green-300 dark:border-green-700'
                  : 'border-red-300 dark:border-red-700'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-semibold">
                {qIndex + 1}
              </span>
              <h3 className="text-base font-medium text-gray-900 dark:text-white pt-1">
                {question.question}
              </h3>
            </div>

            <div className="space-y-2 ml-11">
              {question.options.map((option, oIndex) => {
                const isSelected = answers[question.id] === oIndex;
                const correctIdx = typeof question.correctAnswer === 'number' ? question.correctAnswer : question.correctAnswer[0];
                const isCorrectOption = oIndex === correctIdx;

                let optionClass = 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600';
                if (results) {
                  if (isCorrectOption) {
                    optionClass = 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20';
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20';
                  } else {
                    optionClass = 'border-gray-200 dark:border-gray-700 opacity-60';
                  }
                } else if (isSelected) {
                  optionClass = 'border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/30';
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(question.id, oIndex)}
                    disabled={!!results}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3 ${optionClass}`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      isSelected && !results
                        ? 'border-indigo-500 bg-indigo-500'
                        : results && isCorrectOption
                          ? 'border-green-500 bg-green-500'
                          : results && isSelected
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {((isSelected && !results) || (results && (isCorrectOption || isSelected))) && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                    {results && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                    {results && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                  </button>
                );
              })}
            </div>

            {questionResult && (
              <div className={`mt-4 ml-11 p-3 rounded-lg text-sm ${
                questionResult.correct
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                <p className="font-medium mb-1">
                  {questionResult.correct ? 'Correct!' : 'Incorrect'}
                </p>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {!results ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answers'}
          {!isSubmitting && <ChevronRight className="w-4 h-4" />}
        </button>
      ) : (
        <div className={`text-center p-6 rounded-xl border ${
          results.score === results.maxScore
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : results.score >= results.maxScore * 0.7
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
        }`}>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {results.score}/{results.maxScore}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {results.score === results.maxScore
              ? 'Perfect score! Excellent work!'
              : results.score >= results.maxScore * 0.7
                ? 'Good job! You passed.'
                : 'Keep practicing. You can try again.'}
          </p>
        </div>
      )}
    </div>
  );
}

export type { QuizResults };
