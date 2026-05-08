export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface Param {
  name: string;
  value: string;
  description: string;
  required?: boolean;
}
export interface Header {
  key: string;
  value: string;
}
export interface Scenario {
  status: number;
  description: string;
  body: unknown;
}
export interface UiEndpoint {
  id: string;
  method: Method;
  name: string;
  path: string;
  description: string;
  body: string;
  params: Param[];
  query: Param[];
  headers: Header[];
  scenarios: Scenario[];
  /** One-line return / response summary from scan + AI */
  response?: string;
}
export interface UiFolder {
  name: string;
  /** AI folder/module blurb from analyze-project (sync). */
  overview?: string;
  endpoints: UiEndpoint[];
}
export interface UiCollection {
  id: string;
  name: string;
  description: string;
  /** From sync (e.g. NestJS) */
  framework?: string;
  folders: UiFolder[];
  /** Full API `folderOverviews` so saves can merge without dropping AI rows or name mismatches. */
  folderOverviewsRaw?: { name: string; description: string }[] | null;
  /** When true, `/docs/[numericProjectId]` is publicly readable. */
  docsPublished?: boolean;
  /** Base URL shown on published docs (optional). */
  docsBaseUrl?: string;
  /** Global route prefix from sync (e.g. `/api/v1`); paths in UI are already fully prefixed. */
  apiRoutePrefix?: string;
}
