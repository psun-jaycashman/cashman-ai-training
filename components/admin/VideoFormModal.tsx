'use client';
import { useState } from 'react';
import { MODULES } from '@/lib/module-data';
import type { TrainingVideo } from '@/lib/types';
import VideoUploadField from './VideoUploadField';
import { detectProvider } from '@/lib/video-embed';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface Props {
  existing?: TrainingVideo;
  onClose: () => void;
  onSaved: () => void;
}

export default function VideoFormModal({ existing, onClose, onSaved }: Props) {
  const isEdit = !!existing;
  const [sourceChoice, setSourceChoice] = useState<'uploaded' | 'external'>(existing?.source ?? 'uploaded');
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState(existing?.externalUrl ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [moduleId, setModuleId] = useState(existing?.moduleId ?? MODULES[0].id);
  const [lessonId, setLessonId] = useState(existing?.lessonId ?? '');
  const [order, setOrder] = useState(existing?.order ?? 0);
  const [error, setError] = useState<string | null>(null);

  const selectedModule = MODULES.find((m) => m.id === moduleId);
  const detectedProvider = !isEdit && sourceChoice === 'external' && externalUrl
    ? (() => { try { return detectProvider(externalUrl); } catch { return null; } })()
    : null;

  const submitExternal = async () => {
    const res = await fetch(`${basePath}/api/admin/training-videos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        source: 'external', externalUrl, moduleId, title,
        description: description || undefined,
        lessonId: lessonId || undefined,
        order,
      }),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed'); return; }
    onSaved();
  };

  const submitEdit = async () => {
    const res = await fetch(`${basePath}/api/admin/training-videos/${existing!.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, description: description || undefined, moduleId, lessonId: lessonId || undefined, order }),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'Save failed'); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit video' : 'Add video'}</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        {!isEdit && (
          <div className="mb-4">
            <label className="mr-4"><input type="radio" checked={sourceChoice === 'uploaded'} onChange={() => setSourceChoice('uploaded')} /> Upload file</label>
            <label><input type="radio" checked={sourceChoice === 'external'} onChange={() => setSourceChoice('external')} /> Paste link</label>
          </div>
        )}

        {!isEdit && sourceChoice === 'uploaded' && (
          <div className="mb-4">
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        )}
        {!isEdit && sourceChoice === 'external' && (
          <div className="mb-4">
            <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full border rounded px-2 py-1" />
            {detectedProvider && <div className="text-xs text-gray-500 mt-1">Detected: {detectedProvider}</div>}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Module</label>
            <select value={moduleId} onChange={(e) => { setModuleId(e.target.value); setLessonId(''); }} className="w-full border rounded px-2 py-1">
              {MODULES.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm">Lesson</label>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="">Module-level</option>
              {selectedModule?.lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-24 border rounded px-2 py-1" />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 border rounded">Cancel</button>
          {isEdit ? (
            <button onClick={submitEdit} className="px-3 py-1.5 bg-indigo-500 text-white rounded">Save</button>
          ) : sourceChoice === 'external' ? (
            <button onClick={submitExternal} className="px-3 py-1.5 bg-indigo-500 text-white rounded">Save</button>
          ) : file ? (
            <VideoUploadField
              file={file} moduleId={moduleId} title={title}
              description={description || undefined}
              lessonId={lessonId || undefined}
              order={order}
              onDone={() => onSaved()}
              onError={setError}
            />
          ) : (
            <button disabled className="px-3 py-1.5 bg-gray-300 rounded">Pick a file</button>
          )}
        </div>
      </div>
    </div>
  );
}
