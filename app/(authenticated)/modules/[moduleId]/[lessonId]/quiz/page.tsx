'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Award } from 'lucide-react';
import QuizComponent from '@/components/modules/QuizComponent';
import type { Module, Quiz, Badge } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function QuizPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [module_, setModule] = useState<Module | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ score: number; maxScore: number } | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [moduleRes, quizRes] = await Promise.all([
          fetch(`${basePath}/api/modules/${moduleId}`, { credentials: 'include' }),
          fetch(`${basePath}/api/quizzes?moduleId=${moduleId}&lessonId=${lessonId}`, { credentials: 'include' }),
        ]);

        if (moduleRes.ok) {
          const data = await moduleRes.json();
          setModule(data.module || data);
        }
        if (quizRes.ok) {
          const data = await quizRes.json();
          setQuiz(data.quiz || data);
        }
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [moduleId, lessonId]);

  const handleSubmit = async (answers: Record<string, number | number[]>) => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (res.ok) {
        const data = await res.json();
        setScore({ score: data.score, maxScore: data.maxScore });
        setNewBadges(data.newBadges || []);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const lesson = module_?.lessons?.find((l) => l.id === lessonId);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quiz Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No quiz is available for this lesson.
        </p>
        <Link
          href={`/modules/${moduleId}/${lessonId}`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Back to Lesson
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/modules/${moduleId}/${lessonId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {lesson?.title || 'Lesson'}
      </Link>

      {/* Quiz Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {quiz.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} - Select the best answer for each question.
        </p>
      </div>

      {/* Quiz Questions */}
      <QuizComponent
        questions={quiz.questions}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />

      {/* New Badges */}
      {submitted && newBadges.length > 0 && (
        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            New Badge{newBadges.length > 1 ? 's' : ''} Earned!
          </h3>
          <div className="flex justify-center gap-4 mt-4">
            {newBadges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {badge.badgeType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-submission navigation */}
      {submitted && (
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href={`/modules/${moduleId}/${lessonId}`}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Lesson
          </Link>
          <Link
            href={`/modules/${moduleId}`}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Module Overview
          </Link>
        </div>
      )}
    </div>
  );
}
