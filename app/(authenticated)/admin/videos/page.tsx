'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import { useRouter } from 'next/navigation';
import { Shield, Plus } from 'lucide-react';
import type { TrainingVideo } from '@/lib/types';
import { isAdminRole } from '@/lib/admin-roles';
import VideoListByModule from '@/components/admin/VideoListByModule';
import VideoFormModal from '@/components/admin/VideoFormModal';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function AdminVideosPage() {
  const { user } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TrainingVideo | null>(null);
  const isAdmin = isAdminRole(user?.roles);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${basePath}/api/admin/training-videos`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setVideos(data.videos ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin && user) { router.replace('/'); return; }
    if (isAdmin) void refresh();
  }, [isAdmin, user, router, refresh]);

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Training Videos</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded">
          <Plus className="w-4 h-4" /> Add video
        </button>
      </div>
      {loading ? (
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
      ) : (
        <VideoListByModule
          videos={videos}
          onEdit={(v) => { setEditing(v); setShowForm(true); }}
          onChanged={refresh}
        />
      )}
      {showForm && (
        <VideoFormModal
          existing={editing ?? undefined}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); void refresh(); }}
        />
      )}
    </div>
  );
}
