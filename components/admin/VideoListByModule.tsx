'use client';
import type { TrainingVideo } from '@/lib/types';
import { MODULES } from '@/lib/module-data';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface Props {
  videos: TrainingVideo[];
  onEdit: (v: TrainingVideo) => void;
  onChanged: () => void;
}

export default function VideoListByModule({ videos, onEdit, onChanged }: Props) {
  const swap = async (a: TrainingVideo, b: TrainingVideo) => {
    await Promise.all([
      fetch(`${basePath}/api/admin/training-videos/${a.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ order: b.order }),
      }),
      fetch(`${basePath}/api/admin/training-videos/${b.id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ order: a.order }),
      }),
    ]);
    onChanged();
  };

  const remove = async (v: TrainingVideo) => {
    if (!confirm(`Delete '${v.title}'? This also removes the file from storage.`)) return;
    const res = await fetch(`${basePath}/api/admin/training-videos/${v.id}`, {
      method: 'DELETE', credentials: 'include',
    });
    if (res.ok) onChanged();
  };

  return (
    <div className="space-y-4">
      {MODULES.map((mod) => {
        const modVideos = videos.filter((v) => v.moduleId === mod.id).sort((a, b) => a.order - b.order);
        if (modVideos.length === 0) return null;
        return (
          <div key={mod.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
            <h3 className="font-semibold mb-2">{mod.title}</h3>
            <ul className="divide-y">
              {modVideos.map((v, idx) => {
                const lesson = v.lessonId ? mod.lessons.find((l) => l.id === v.lessonId) : null;
                const badge = v.source === 'uploaded' ? 'Uploaded' : (v.externalProvider ?? 'External');
                return (
                  <li key={v.id} className="py-2 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{v.title}</div>
                      <div className="text-xs text-gray-500">
                        {badge} · {lesson ? `Lesson: ${lesson.title}` : 'Module-level'}
                        {v.sizeBytes ? ` · ${(v.sizeBytes / 1024 / 1024).toFixed(0)} MB` : ''}
                      </div>
                    </div>
                    <button disabled={idx === 0} onClick={() => swap(v, modVideos[idx - 1])} className="p-1 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                    <button disabled={idx === modVideos.length - 1} onClick={() => swap(v, modVideos[idx + 1])} className="p-1 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => onEdit(v)} className="p-1"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(v)} className="p-1 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
