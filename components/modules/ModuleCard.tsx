'use client';

import Link from 'next/link';
import {
  Brain,
  Shield,
  Bot,
  Database,
  Zap,
  BookOpen,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import type { Module } from '@/lib/types';

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  bot: <Bot className="w-6 h-6" />,
  database: <Database className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  'book-open': <BookOpen className="w-6 h-6" />,
};

interface ModuleCardProps {
  module: Module;
  completedLessons: number;
  totalLessons: number;
}

export default function ModuleCard({ module, completedLessons, totalLessons }: ModuleCardProps) {
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const isComplete = completedLessons === totalLessons && totalLessons > 0;

  return (
    <Link href={`/modules/${module.id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            {iconMap[module.icon] || <BookOpen className="w-6 h-6" />}
          </div>
          {isComplete && (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {module.title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
          {module.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <User className="w-3.5 h-3.5" />
          <span>{module.instructor}</span>
          <span className="mx-1">-</span>
          <Clock className="w-3.5 h-3.5" />
          <span>{module.estimatedMinutes} min</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: isComplete ? '#22c55e' : '#4f46e5',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
