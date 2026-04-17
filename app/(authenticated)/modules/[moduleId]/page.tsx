'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  User,
  PlayCircle,
  BookOpen,
} from 'lucide-react';
import ProgressRing from '@/components/modules/ProgressRing';
import VideoPlayer from '@/components/VideoPlayer';
import type { Module, UserProgress, TrainingVideoWithPlayback } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ModuleViewPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [module_, setModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [moduleVideo, setModuleVideo] = useState<TrainingVideoWithPlayback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [moduleRes, progressRes, videosRes] = await Promise.all([
          fetch(`${basePath}/api/modules/${moduleId}`, { credentials: 'include' }),
          fetch(`${basePath}/api/progress?moduleId=${moduleId}`, { credentials: 'include' }),
          fetch(`${basePath}/api/training-videos?moduleId=${moduleId}`, { credentials: 'include' }),
        ]);

        if (moduleRes.ok) {
          const data = await moduleRes.json();
          setModule(data.module || data);
        }
        if (progressRes.ok) {
          const data = await progressRes.json();
          setProgress(data.progress || data || []);
        }
        if (videosRes.ok) {
          const data = await videosRes.json();
          const videos: TrainingVideoWithPlayback[] = data.videos || [];
          const moduleLevel = videos.find((v) => !v.lessonId);
          if (moduleLevel) setModuleVideo(moduleLevel);
        }
      } catch (err) {
        console.error('Failed to fetch module:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!module_) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Module Not Found</h2>
        <Link href="/modules" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to Modules
        </Link>
      </div>
    );
  }

  const lessons = module_.lessons || [];
  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId)
  );
  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  // Find the first incomplete lesson to suggest
  const nextLesson = lessons.find((l) => !completedLessonIds.has(l.id)) || lessons[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/modules"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Modules
      </Link>

      {/* Module Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Video Placeholder */}
          <div className="flex-shrink-0 w-full md:w-96">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
              <PlayCircle className="w-16 h-16 text-white/80" />
              <span className="absolute bottom-3 left-3 text-xs text-white/60 bg-black/40 px-2 py-1 rounded">
                Module Introduction
              </span>
            </div>
          </div>

          {/* Module Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {module_.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {module_.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {module_.instructor}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {module_.estimatedMinutes} min
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> {lessons.length} lessons
              </span>
            </div>

            <div className="flex items-center gap-4">
              <ProgressRing percentage={progressPercent} size={60} strokeWidth={5} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {completedCount}/{lessons.length} completed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {progressPercent === 100 ? 'Module complete!' : `${Math.round(progressPercent)}% done`}
                </p>
              </div>
              {nextLesson && progressPercent < 100 && (
                <Link
                  href={`/modules/${moduleId}/${nextLesson.id}`}
                  className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {completedCount === 0 ? 'Start Learning' : 'Continue'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Module Video */}
      {moduleVideo && (
        <div className="mb-8">
          <VideoPlayer video={moduleVideo} />
        </div>
      )}

      {/* Lesson List */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lessons</h2>
      <div className="space-y-2">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessonIds.has(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/modules/${moduleId}/${lesson.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-5 py-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      {index + 1}.
                    </span>
                    <h3 className={`text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                      isCompleted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {lesson.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} min
                    </span>
                    {lesson.quizId && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                        Quiz
                      </span>
                    )}
                    {lesson.interactiveType && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                        Interactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
