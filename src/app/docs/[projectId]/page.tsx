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
  const collectionId = /^col-([0-9a-fA-F-]+)$/.test(data.id) ? data.id : null;
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setData(null);
    setIsPreviewMode(false);
    if (!projectId || projectId.trim() === '') {
      setError('Invalid project id.');
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const authHeaders = getAuthHeaders();
        let isPreview = false;

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
            
            // If the project metadata indicates it is unpublished, then we are in Preview Mode
            const isPreview = !payload.docsPublished;

            if (!cancelled) {
              setData(payload);
              setIsPreviewMode(isPreview);
            }
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
          setIsPreviewMode(false);
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
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: '#0D0D0D', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Futuristic glowing abstract background layers */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[#CFFE26]/5 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" />

        <div className="max-w-xl w-full z-10 flex flex-col items-center text-center">
          {/* Neon Icon Block */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 shadow-2xl relative">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          </div>

          {/* Status Label */}
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            Unpublished Documentation
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Documentation is Private or Empty
          </h1>
          
          <p className="text-[13px] text-white/40 leading-relaxed mb-8 max-w-md">
            This API collection does not have active public documentation. Follow the quick guide below to go public with your API!
          </p>

          {/* Visual Step Card */}
          <div 
            className="w-full text-left rounded-2xl border p-5 mb-8 space-y-4"
            style={{ borderColor: '#222', background: 'rgba(20,20,20,0.5)', backdropFilter: 'blur(10px)' }}
          >
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-1">
              How to Publish this Collection
            </h3>
            
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-bold text-xs text-[#CFFE26]">
                1
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed pt-0.5">
                Open the <strong className="text-white font-semibold">Rauts Dashboard</strong> and select your collection on the sidebar tree.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-bold text-xs text-[#CFFE26]">
                2
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed pt-0.5">
                On the top collection overview panel, check the <strong className="text-white font-semibold">"Publish Documentation"</strong> toggle.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-bold text-xs text-[#CFFE26]">
                3
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed pt-0.5">
                Refresh this link to instantly view your live API docs.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center w-full">
            <Link 
              href="/dashboard"
              className="w-full max-w-sm py-3.5 px-6 rounded-xl font-bold text-black text-center text-xs transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(207,254,38,0.25)]"
              style={{ background: '#CFFE26' }}
            >
              Open Dashboard Workspace
            </Link>
          </div>
        </div>
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

  return <PublishedDocsViewer data={data} isPreviewMode={isPreviewMode} projectId={projectId} />;
}
