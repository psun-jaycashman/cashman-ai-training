'use client';
import { useState } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

interface Props {
  moduleId: string;
  lessonId?: string;
  title: string;
  description?: string;
  order?: number;
  file: File;
  onDone: (videoId: string) => void;
  onError: (message: string) => void;
}

export default function VideoUploadField({
  moduleId, lessonId, title, description, order, file, onDone, onError,
}: Props) {
  const [percent, setPercent] = useState(0);
  const [xhr, setXhr] = useState<XMLHttpRequest | null>(null);

  const start = () => {
    if (file.size > MAX_BYTES) {
      onError(`File is ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB. Max is 2 GB.`);
      return;
    }
    if (!file.type.startsWith('video/')) {
      onError('File must be a video.');
      return;
    }
    const fd = new FormData();
    fd.set('file', file);
    fd.set('moduleId', moduleId);
    fd.set('title', title);
    if (lessonId) fd.set('lessonId', lessonId);
    if (description) fd.set('description', description);
    if (order !== undefined) fd.set('order', String(order));

    const req = new XMLHttpRequest();
    req.open('POST', `${basePath}/api/admin/training-videos`);
    req.withCredentials = true;
    req.upload.onprogress = (e) => {
      if (e.lengthComputable) setPercent(Math.round((e.loaded / e.total) * 100));
    };
    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        try {
          const body = JSON.parse(req.responseText);
          onDone(body.id);
        } catch { onError('Upload succeeded but response was malformed.'); }
      } else if (req.status === 413) {
        onError(
          'File too large for the server. This is usually an nginx ' +
          '`client_max_body_size` limit (default 1 MB). Ask an admin to raise ' +
          'it (see README → "Training Videos" → "Upload limits") and redeploy.'
        );
      } else {
        let msg = `Upload failed (${req.status})`;
        try { msg = JSON.parse(req.responseText).error || msg; } catch {}
        onError(msg);
      }
    };
    req.onerror = () => onError('Network error during upload.');
    setXhr(req);
    req.send(fd);
  };

  const cancel = () => { xhr?.abort(); setXhr(null); setPercent(0); };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
      </div>
      {xhr ? (
        <>
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-indigo-500 rounded transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span>{percent}%</span>
            <button type="button" onClick={cancel} className="text-red-600">Cancel</button>
          </div>
        </>
      ) : (
        <button type="button" onClick={start} className="px-3 py-1.5 bg-indigo-500 text-white rounded text-sm">
          Start upload
        </button>
      )}
    </div>
  );
}
