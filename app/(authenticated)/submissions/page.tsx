'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Download,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileImage,
  Filter,
  Clock,
} from 'lucide-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface Submission {
  id: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string | null;
  exerciseId: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  responseExcerpt: string | null;
  uploadedAt: string;
  uploaderUserId: string;
  uploaderName: string;
  isMine: boolean;
  downloadUrl: string | null;
  downloadError: string | null;
  expiresAt: string | null;
}

interface SubmissionsResponse {
  submissions: Submission[];
  libraryConfigured: boolean;
}

function formatBytes(b: number | null): string {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function fileIcon(name: string, mimeType: string | null) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || mimeType?.includes('sheet')) {
    return <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />;
  }
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt') || mimeType?.includes('presentation')) {
    return <FileImage className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  }
  return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
}

export default function SubmissionsPage() {
  const [data, setData] = useState<SubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [lessonFilter, setLessonFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${basePath}/api/submissions`, {
          credentials: 'include',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || `Request failed (${res.status})`);
          return;
        }
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const submissions = data?.submissions ?? [];

  const moduleOptions = useMemo(() => {
    const set = new Map<string, string>();
    for (const s of submissions) {
      if (!set.has(s.moduleId)) set.set(s.moduleId, s.moduleId);
    }
    return Array.from(set.keys()).sort();
  }, [submissions]);

  const lessonOptions = useMemo(() => {
    const set = new Map<string, { id: string; title: string }>();
    for (const s of submissions) {
      if (moduleFilter !== 'all' && s.moduleId !== moduleFilter) continue;
      if (!set.has(s.lessonId)) {
        set.set(s.lessonId, {
          id: s.lessonId,
          title: s.lessonTitle ?? s.lessonId,
        });
      }
    }
    return Array.from(set.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [submissions, moduleFilter]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (moduleFilter !== 'all' && s.moduleId !== moduleFilter) return false;
      if (lessonFilter !== 'all' && s.lessonId !== lessonFilter) return false;
      return true;
    });
  }, [submissions, moduleFilter, lessonFilter]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Inbox className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submissions</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Files submitted on exercise tasks across the course. Browse what
          your peers produced — different angles surface different lessons.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {data && !data.libraryConfigured && submissions.length === 0 && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 dark:text-amber-200">
            <p className="font-medium mb-1">Shared library not configured yet</p>
            <p>
              Set <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">STUDENT_SUBMISSIONS_LIBRARY_ID</code>{' '}
              in the deployment env and bind the app role to that library in the data-api admin UI.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {submissions.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setLessonFilter('all');
            }}
            className="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All modules</option>
            {moduleOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {lessonOptions.length > 0 && (
            <select
              value={lessonFilter}
              onChange={(e) => setLessonFilter(e.target.value)}
              className="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All lessons</option>
              {lessonOptions.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-500 ml-auto">
            {filtered.length} of {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
          </span>
        </div>
      )}

      {/* Empty state */}
      {submissions.length === 0 && !error && data?.libraryConfigured && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <Inbox className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">No submissions yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Be the first — finish an exercise that accepts a file and your work will land here.
          </p>
        </div>
      )}

      {/* List */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  {fileIcon(s.fileName, s.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <Link
                      href={`/modules/${s.moduleId}/${s.lessonId}`}
                      className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {s.lessonTitle ?? s.lessonId}
                    </Link>
                    {s.isMine && (
                      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-base text-gray-900 dark:text-white font-medium break-all mb-1">
                    {s.fileName}
                    {s.sizeBytes ? (
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                        {formatBytes(s.sizeBytes)}
                      </span>
                    ) : null}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>by <span className="font-medium text-gray-700 dark:text-gray-300">{s.uploaderName}</span></span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(s.uploadedAt)}
                    </span>
                  </div>
                  {s.responseExcerpt && (
                    <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-md p-3 whitespace-pre-wrap leading-relaxed">
                      {s.responseExcerpt}
                    </div>
                  )}
                  {s.downloadUrl ? (
                    <a
                      href={s.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  ) : (
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {s.downloadError ?? 'Download not available right now.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
