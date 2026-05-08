import type { Method } from '@/types/dashboard-ui';

export const METHOD_COLOR: Record<Method | string, string> = {
  GET: '#61AFFE',
  POST: '#49CC90',
  PUT: '#FCA130',
  PATCH: '#50E3C2',
  DELETE: '#F93E3E',
  OPTIONS: '#989898',
  HEAD: '#B794F6',
};

export const STATUS_TEXT: Record<number, string> = {
  200: 'OK', 201: 'Created', 204: 'No Content',
  400: 'Bad Request', 401: 'Unauthorized', 402: 'Payment Required',
  403: 'Forbidden', 404: 'Not Found', 409: 'Conflict',
  422: 'Unprocessable Entity', 500: 'Internal Server Error',
};

export function stringifyBody(body: unknown): string {
  if (body === null || body === undefined) return '';
  if (typeof body === 'string') return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
}
