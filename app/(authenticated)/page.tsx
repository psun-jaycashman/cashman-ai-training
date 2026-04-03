'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import { BookOpen, Award, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ModuleCard from '@/components/modules/ModuleCard';
import ProgressRing from '@/components/modules/ProgressRing';
import type { Module, Badge, UserProgress } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function DashboardPage() {
  const { user } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [modulesRes, badgesRes, progressRes] = await Promise.all([
          fetch(`${basePath}/api/modules`, { credentials: 'include' }),
          fetch(`${basePath}/api/badges`, { credentials: 'include' }),
          fetch(`${basePath}/api/progress`, { credentials: 'include' }),
        ]);

        if (modulesRes.ok) {
          const data = await modulesRes.json();
          setModules(data.modules || data || []);
        }
        if (badgesRes.ok) {
          const data = await badgesRes.json();
          setBadges(data.badges || data || []);
        }
        if (progressRes.ok) {
          const data = await progressRes.json();
          setProgress(data.progress || data || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const completedLessons = progress.filter((p) => p.completed);
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const overallPercentage = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

  const getModuleProgress = (moduleId: string) => {
    return progress.filter((p) => p.moduleId === moduleId && p.completed).length;
  };

  const firstName = user?.email?.split('@')[0]?.split('.')[0] || 'there';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {displayName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue your AI training journey with Think (AI)mpossible.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <ProgressRing percentage={overallPercentage} size={90} strokeWidth={7} color="#4f46e5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {completedLessons.length}/{totalLessons}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">lessons completed</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedLessons.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Lessons Completed</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{badges.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {modules.filter((m) => getModuleProgress(m.id) === (m.lessons?.length || 0) && (m.lessons?.length || 0) > 0).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Modules Completed</p>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Training Modules</h2>
          <Link
            href="/modules"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                completedLessons={getModuleProgress(mod.id)}
                totalLessons={mod.lessons?.length || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No modules available yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Training modules will appear here once they are configured.</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {completedLessons.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
            {completedLessons.slice(0, 5).map((p) => {
              const mod = modules.find((m) => m.id === p.moduleId);
              const lesson = mod?.lessons?.find((l) => l.id === p.lessonId);
              return (
                <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {lesson?.title || p.lessonId}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {mod?.title || p.moduleId}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
