'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  Shield,
  Bot,
  Database,
  Zap,
  BookOpen,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import type { Module, UserProgress } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="w-7 h-7" />,
  shield: <Shield className="w-7 h-7" />,
  bot: <Bot className="w-7 h-7" />,
  database: <Database className="w-7 h-7" />,
  zap: <Zap className="w-7 h-7" />,
  'book-open': <BookOpen className="w-7 h-7" />,
};

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [modulesRes, progressRes] = await Promise.all([
          fetch(`${basePath}/api/modules`, { credentials: 'include' }),
          fetch(`${basePath}/api/progress`, { credentials: 'include' }),
        ]);

        if (modulesRes.ok) {
          const data = await modulesRes.json();
          setModules(data.modules || data || []);
        }
        if (progressRes.ok) {
          const data = await progressRes.json();
          setProgress(data.progress || data || []);
        }
      } catch (err) {
        console.error('Failed to fetch modules:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getModuleCompletedCount = (moduleId: string) => {
    return progress.filter((p) => p.moduleId === moduleId && p.completed).length;
  };

  const getButtonState = (moduleId: string, totalLessons: number) => {
    const completed = getModuleCompletedCount(moduleId);
    if (completed === 0) return { label: 'Start Module', variant: 'primary' as const };
    if (completed >= totalLessons) return { label: 'Review', variant: 'secondary' as const };
    return { label: 'Continue', variant: 'primary' as const };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Training Modules</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Master AI skills step by step. Complete each module to earn badges and certificates.
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((mod) => {
          const totalLessons = mod.lessons?.length || 0;
          const completedCount = getModuleCompletedCount(mod.id);
          const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
          const isComplete = completedCount === totalLessons && totalLessons > 0;
          const buttonState = getButtonState(mod.id, totalLessons);

          return (
            <div
              key={mod.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  {iconMap[mod.icon] || <BookOpen className="w-7 h-7" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {mod.title}
                    </h3>
                    {mod.isBonus && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                        Bonus · doesn&apos;t count toward completion
                      </span>
                    )}
                    {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {mod.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {mod.instructor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {mod.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {totalLessons} lessons
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: isComplete ? '#22c55e' : '#4f46e5',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {completedCount}/{totalLessons}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  <Link
                    href={`/modules/${mod.id}`}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      buttonState.variant === 'primary'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {buttonState.label}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No modules available</h3>
          <p className="text-gray-500 dark:text-gray-400">Training modules will appear here once configured.</p>
        </div>
      )}
    </div>
  );
}
