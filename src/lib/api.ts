import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const SESSION_EXPIRED_EVENT = 'routiq:session-expired';

function parseErrorMessage(result: unknown, fallback: string): string {
  if (!result || typeof result !== 'object') return fallback;
  const msg = (result as { message?: unknown }).message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.map(String).filter(Boolean).join(', ');
  return fallback;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const authStorage = localStorage.getItem('routiq-auth-storage');
  if (authStorage) {
    const parsed = JSON.parse(authStorage);
    const token = parsed.state?.token;
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/** Workspace environments are keyed by logged-in user id (same as dashboard `userEnvKey`). */
export function readPersistedAuthUserId(): number | null {
  try {
    const authStorage = localStorage.getItem('routiq-auth-storage');
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage) as { state?: { user?: { id?: number } } };
    const id = parsed.state?.user?.id;
    return typeof id === 'number' && Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export const api = {
  get: async (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: async (endpoint: string, data: unknown) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: async (endpoint: string, data: unknown) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  put: async (endpoint: string, data: unknown) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};

let handledUnauthorized = false;

function handleUnauthorizedResponse() {
  if (typeof window === 'undefined') return;
  if (handledUnauthorized) return;

  const { isLoggedIn, logout } = useAuthStore.getState();
  if (!isLoggedIn) return;

  handledUnauthorized = true;
  logout();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));

  if (!window.location.pathname.startsWith('/auth')) {
    window.location.assign('/auth/login');
    return;
  }
  window.setTimeout(() => {
    handledUnauthorized = false;
  }, 1000);
}

async function request(endpoint: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(init.headers ?? {}),
    },
  });

  const result = await parseJsonResponse(response);
  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorizedResponse();
    }
    throw new Error(parseErrorMessage(result, 'Something went wrong'));
  }

  if (response.status !== 401) {
    handledUnauthorized = false;
  }
  return result;
}
