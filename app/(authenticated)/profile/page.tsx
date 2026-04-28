'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import {
  User,
  Mail,
  BookOpen,
  Award,
  Download,
  CheckCircle2,
} from 'lucide-react';
import ProgressRing from '@/components/modules/ProgressRing';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import type { Module, UserProgress, Badge, BadgeDefinition, BadgeType } from '@/lib/types';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const ALL_BADGE_DEFINITIONS: BadgeDefinition[] = [
  { type: 'first-steps', name: 'First Steps', description: 'Completed your first lesson', icon: 'Footprints', criteria: 'Complete any 1 lesson' },
  { type: 'quick-learner', name: 'Quick Learner', description: 'Completed 5 lessons in one session', icon: 'Zap', criteria: 'Complete 5 lessons in one session' },
  { type: 'email-ace', name: 'Email Ace', description: 'Completed the AI and Email module', icon: 'Mail', criteria: 'Complete Module 2' },
  { type: 'report-writer', name: 'Report Writer', description: 'Completed Reports and Documents', icon: 'FileText', criteria: 'Complete Module 3' },
  { type: 'data-wrangler', name: 'Data Wrangler', description: 'Completed Spreadsheets and Data', icon: 'Table', criteria: 'Complete Module 4' },
  { type: 'media-maker', name: 'Media Maker', description: 'Completed Images, Video, and Media', icon: 'Image', criteria: 'Complete Module 5' },
  { type: 'search-pro', name: 'Search Pro', description: 'Completed Document Processing and Search', icon: 'Search', criteria: 'Complete Module 6' },
  { type: 'agent-handler', name: 'Agent Handler', description: 'Completed the AI Agents module', icon: 'Bot', criteria: 'Complete Module 7' },
  { type: 'power-user', name: 'Power User', description: 'Completed Power User Tools', icon: 'Rocket', criteria: 'Complete Module 8' },
  { type: 'perfect-score', name: 'Perfect Score', description: 'Got 100% on any quiz', icon: 'Star', criteria: 'Score 100% on any quiz' },
  { type: 'completionist', name: 'Completionist', description: 'Completed all 8 modules', icon: 'Trophy', criteria: 'Complete all modules' },
  { type: 'think-aimpossible', name: 'Think (AI)mpossible', description: 'Earned the AI Training Certificate', icon: 'Award', criteria: 'Complete 95% of lessons + pass final assessment (80%+)' },
];

export default function ProfilePage() {
  const { user } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [modulesRes, progressRes, badgesRes] = await Promise.all([
          fetch(`${basePath}/api/modules`, { credentials: 'include' }),
          fetch(`${basePath}/api/progress`, { credentials: 'include' }),
          fetch(`${basePath}/api/badges`, { credentials: 'include' }),
        ]);

        if (modulesRes.ok) {
          const data = await modulesRes.json();
          setModules(data.modules || data || []);
        }
        if (progressRes.ok) {
          const data = await progressRes.json();
          setProgress(data.progress || data || []);
        }
        if (badgesRes.ok) {
          const data = await badgesRes.json();
          setBadges(data.badges || data || []);
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const completedLessons = progress.filter((p) => p.completed);
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const overallPercent = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

  const completedModules = modules.filter((m) => {
    const modLessons = m.lessons?.length || 0;
    const modCompleted = progress.filter((p) => p.moduleId === m.id && p.completed).length;
    return modLessons > 0 && modCompleted >= modLessons;
  });

  const earnedBadgeTypes: BadgeType[] = badges.map((b) => b.badgeType);
  const certificateEligible = overallPercent >= 95;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

      {/* User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
            {(user?.email?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.email?.split('@')[0]?.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'User'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Mail className="w-4 h-4" />
              <span>{user?.email || 'Unknown'}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {user?.roles?.map((role: string) => (
                <span
                  key={role}
                  className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing percentage={overallPercent} size={80} strokeWidth={6} />
          </div>
        </div>
      </div>

      {/* Progress by Module */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Module Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((mod) => {
            const modLessons = mod.lessons?.length || 0;
            const modCompleted = progress.filter((p) => p.moduleId === mod.id && p.completed).length;
            const modPercent = modLessons > 0 ? (modCompleted / modLessons) * 100 : 0;
            const isModComplete = modLessons > 0 && modCompleted >= modLessons;

            return (
              <div
                key={mod.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{mod.title}</h3>
                  {isModComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${modPercent}%`,
                        backgroundColor: isModComplete ? '#22c55e' : '#4f46e5',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {modCompleted}/{modLessons}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {modules.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No modules available yet.</p>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Badges ({earnedBadgeTypes.length}/{ALL_BADGE_DEFINITIONS.length})
          </h2>
        </div>
        <BadgeGrid earnedBadges={earnedBadgeTypes} allBadges={ALL_BADGE_DEFINITIONS} />
      </div>

      {/* Certificate */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Certificate</h2>
        {certificateEligible ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-8 text-center">
            <div className="max-w-lg mx-auto">
              <div className="border-2 border-indigo-300 dark:border-indigo-600 rounded-lg p-8 bg-white/80 dark:bg-gray-800/80">
                <p className="text-xs text-indigo-500 uppercase tracking-widest mb-4">Certificate of Completion</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Think (AI)mpossible
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">AI Skills Training Program</p>
                <div className="w-16 h-0.5 bg-indigo-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {user?.email?.split('@')[0]?.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Completed {completedModules.length} modules with {earnedBadgeTypes.length} badges earned
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Download Certificate
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Complete at least 95% of the training to earn your certificate.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Current progress: {Math.round(overallPercent)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
