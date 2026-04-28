'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileQuestion,
  Loader2,
} from 'lucide-react';
import type { Module, Lesson, UserProgress, TrainingVideoWithPlayback } from '@/lib/types';
import { getExercise, getGame, getSurvey } from '@/lib/activity-data';
import ExerciseComponent from '@/components/activities/ExerciseComponent';
import GameComponent from '@/components/activities/GameComponent';
import SurveyComponent from '@/components/activities/SurveyComponent';
import VideoPlayer from '@/components/VideoPlayer';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Simple markdown-to-html converter for MVP.
 * Handles headers, bold, italic, code blocks, lists, links, and paragraphs.
 */
function markdownToHtml(md: string): string {
  if (!md) return '';

  // Next.js basePath is required for any absolute path starting with `/`,
  // otherwise `/downloads/foo.pdf` falls through to a Next page handler in
  // production (the page returns HTML — which is why downloads were saving
  // as `.html` instead of the actual PDF).
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const withBasePath = (href: string): string =>
    href.startsWith('/') && !href.startsWith('//') ? `${basePath}${href}` : href;

  let html = md
    // PDF viewer directive: <pdf src="/downloads/foo.pdf" /> → inline iframe
    .replace(/<pdf\s+src="([^"]+)"\s*\/?\s*>/g, (_match, src: string) => {
      const finalSrc = withBasePath(src);
      return `<iframe src="${finalSrc}#view=FitH" class="w-full h-[640px] rounded-lg border border-gray-200 dark:border-gray-700 my-6 bg-gray-50 dark:bg-gray-950" title="PDF preview" loading="lazy"></iframe>`;
    })
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm my-4"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm text-indigo-600 dark:text-indigo-400">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links — prefix basePath for absolute paths; add download for /downloads/
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match: string, text: string, href: string) => {
      const isDownload = href.startsWith('/downloads/');
      const finalHref = withBasePath(href);
      const downloadAttr = isDownload ? ' download' : '';
      return `<a href="${finalHref}" class="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener"${downloadAttr}>${text}</a>`;
    })
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, '<li class="ml-4 list-disc text-gray-700 dark:text-gray-300">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-700 dark:text-gray-300">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-6 border-gray-200 dark:border-gray-700" />')
    // Paragraphs — wrap any line that doesn't already start with an HTML tag
    .replace(/^(?!<[a-zA-Z])(.+)$/gm, '<p class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">$1</p>');

  // Wrap adjacent <li> elements in <ul>
  html = html.replace(/((<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="my-4 space-y-1">$1</ul>');

  return html;
}

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [module_, setModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [lessonVideo, setLessonVideo] = useState<TrainingVideoWithPlayback | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [moduleRes, progressRes, videosRes] = await Promise.all([
          fetch(`${basePath}/api/modules/${moduleId}`, { credentials: 'include' }),
          fetch(`${basePath}/api/progress?moduleId=${moduleId}`, { credentials: 'include' }),
          fetch(
            `${basePath}/api/training-videos?moduleId=${moduleId}&lessonId=${lessonId}`,
            { credentials: 'include' }
          ),
        ]);

        if (moduleRes.ok) {
          const data = await moduleRes.json();
          setModule(data.module || data);
        }
        if (progressRes.ok) {
          const data = await progressRes.json();
          const progressList = data.progress || data || [];
          setProgress(progressList);
          setIsComplete(
            progressList.some((p: UserProgress) => p.lessonId === lessonId && p.completed)
          );
        }
        if (videosRes.ok) {
          const data = await videosRes.json();
          const videos: TrainingVideoWithPlayback[] = data.videos || [];
          if (videos.length > 0) setLessonVideo(videos[0]);
        }
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [moduleId, lessonId]);

  const markComplete = useCallback(async () => {
    setMarking(true);
    try {
      const res = await fetch(`${basePath}/api/progress`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, lessonId }),
      });
      if (res.ok) {
        setIsComplete(true);
      }
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setMarking(false);
    }
  }, [moduleId, lessonId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-96" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!module_) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Module Not Found</h2>
        <Link href="/modules" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to Modules
        </Link>
      </div>
    );
  }

  const lessons = module_.lessons || [];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const lesson: Lesson | undefined = lessons[currentIndex];
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lesson Not Found</h2>
        <Link href={`/modules/${moduleId}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to Module
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/modules" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Modules
        </Link>
        <span>/</span>
        <Link href={`/modules/${moduleId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
          {module_.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium truncate">{lesson.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {lesson.title}
          </h1>
          {isComplete && (
            <CheckCircle2 className="w-7 h-7 text-green-500 flex-shrink-0 mt-1" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {lesson.estimatedMinutes} min
          </span>
          <span>Lesson {currentIndex + 1} of {lessons.length}</span>
        </div>
      </div>

      {/* Lesson Video */}
      {lessonVideo && (
        <div className="mb-6">
          <VideoPlayer video={lessonVideo} />
        </div>
      )}

      {/* Lesson Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content) }}
        />
      </div>

      {/* Mark Complete Button */}
      <div className="mb-6">
        {isComplete ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-5 py-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Lesson completed</span>
          </div>
        ) : (
          <button
            onClick={markComplete}
            disabled={marking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
          >
            {marking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Marking...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Mark as Complete
              </>
            )}
          </button>
        )}
      </div>

      {/* Activity Section */}
      {lesson.activityType === 'quiz' && lesson.quizId && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileQuestion className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Knowledge Check</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test your understanding of this lesson with a short quiz.
          </p>
          <Link
            href={`/modules/${moduleId}/${lessonId}/quiz`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Take Quiz <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {lesson.activityType === 'exercise' && lesson.activityId && (() => {
        const exercise = getExercise(lesson.activityId!);
        if (!exercise) return null;
        return (
          <div className="mb-6">
            <ExerciseComponent
              exercise={exercise}
              onComplete={async (response) => {
                await fetch(`${basePath}/api/activities`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    moduleId, lessonId,
                    activityType: 'exercise',
                    activityId: lesson.activityId,
                    response: { text: response },
                  }),
                });
                if (!isComplete) markComplete();
              }}
            />
          </div>
        );
      })()}

      {lesson.activityType === 'game' && lesson.activityId && (() => {
        const game = getGame(lesson.activityId!);
        if (!game) return null;
        return (
          <div className="mb-6">
            <GameComponent
              game={game}
              onComplete={async (result) => {
                await fetch(`${basePath}/api/activities`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    moduleId, lessonId,
                    activityType: 'game',
                    activityId: lesson.activityId,
                    response: result,
                  }),
                });
                if (!isComplete) markComplete();
              }}
            />
          </div>
        );
      })()}

      {lesson.activityType === 'survey' && lesson.activityId && (() => {
        const survey = getSurvey(lesson.activityId!);
        if (!survey) return null;
        return (
          <div className="mb-6">
            <SurveyComponent
              survey={survey}
              onComplete={async (answers) => {
                await fetch(`${basePath}/api/activities`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    moduleId, lessonId,
                    activityType: 'survey',
                    activityId: lesson.activityId,
                    response: answers,
                  }),
                });
                if (!isComplete) markComplete();
              }}
            />
          </div>
        );
      })()}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        {prevLesson ? (
          <Link
            href={`/modules/${moduleId}/${prevLesson.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{prevLesson.title}</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <Link
            href={`/modules/${moduleId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Module Overview
          </Link>
        )}
        {nextLesson ? (
          <Link
            href={`/modules/${moduleId}/${nextLesson.id}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            <span className="hidden sm:inline">{nextLesson.title}</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/modules/${moduleId}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Back to Module <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
