'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  PublishedDocsViewer,
  type PublishedDocsCollection,
} from '@/components/published-docs/PublishedDocsViewer';
import { getAuthHeaders, readPersistedAuthUserId } from '@/lib/api';
import { getActiveWorkspaceResolvedBaseUrl } from '@/lib/dashboard/workspace-environments';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function mergeWorkspaceBaseUrlIntoDocs(data: PublishedDocsCollection): PublishedDocsCollection {
  const userId = readPersistedAuthUserId();
  if (userId == null) return data;
  const collectionId = /^col-\d+$/.test(data.id) ? data.id : null;
  if (!collectionId) return data;
  const base = getActiveWorkspaceResolvedBaseUrl(String(userId), collectionId);
  if (!base) return data;
  return { ...data, baseUrl: base };
}

async function parseDocsError(res: Response): Promise<string> {
  const json = (await res.json().catch(() => ({}))) as {
    message?: string | string[];
  };
  return Array.isArray(json.message)
    ? json.message.join(', ')
    : typeof json.message === 'string'
      ? json.message
      : `Request failed (${res.status})`;
}

export default function PublishedDocsByProjectPage() {
  const params = useParams();
  const projectId = String(params?.projectId ?? '');
  const [data, setData] = useState<PublishedDocsCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setData(null);
    if (!projectId || !/^\d+$/.test(projectId)) {
      setError('Invalid project id.');
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const authHeaders = getAuthHeaders();

        if (authHeaders.Authorization) {
          const ownerRes = await fetch(
            `${API_BASE_URL}/projects/${projectId}/published-docs-snapshot`,
            {
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
              },
            },
          );
          if (ownerRes.ok) {
            const payload = mergeWorkspaceBaseUrlIntoDocs(
              (await ownerRes.json()) as PublishedDocsCollection,
            );
            if (!cancelled) setData(payload);
            return;
          }
          if (ownerRes.status !== 401 && ownerRes.status !== 403 && ownerRes.status !== 404) {
            throw new Error(await parseDocsError(ownerRes));
          }
        }

        const res = await fetch(`${API_BASE_URL}/public/docs/${projectId}`);
        const json = (await res.json().catch(() => ({}))) as PublishedDocsCollection & {
          message?: string | string[];
        };
        if (!res.ok) {
          throw new Error(await parseDocsError(res));
        }
        if (!cancelled) {
          setData(json as PublishedDocsCollection);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load documentation');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ background: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <p className="text-[14px] max-w-md" style={{ color: 'rgba(248,113,113,0.95)' }}>
          {error}
        </p>
        <p className="text-[12px] max-w-md" style={{ color: 'rgba(255,255,255,0.38)' }}>
          The collection owner can turn on <strong className="text-white/60">Publish documentation</strong> on the
          collection overview in the Rauts workspace, then share this link again.
        </p>
        <Link href="/docs" className="text-[12px] font-medium underline" style={{ color: '#CFFE26' }}>
          Open sample docs
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Loading documentation…
        </p>
      </div>
    );
  }

  return <PublishedDocsViewer data={data} />;
}
