export type LiveHttpResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  ms: number;
  headers: { key: string; value: string }[];
  bodyText: string;
  parsedJson: unknown | null;
  /** Present when fetch threw (e.g. CORS / offline) */
  error?: 'network';
};
