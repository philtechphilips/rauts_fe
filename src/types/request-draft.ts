export const AUTH_TYPES = ['Bearer Token', 'API Key', 'Basic Auth', 'OAuth 2.0', 'No Auth'] as const;
export type AuthType = (typeof AUTH_TYPES)[number];

export type ManualParamRow = {
  id: string;
  key: string;
  value: string;
  description: string;
};

export type ManualHeaderRow = {
  id: string;
  key: string;
  value: string;
};

export type AuthConfig = {
  type: AuthType;
  bearerToken: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyAddTo: 'header' | 'query';
  basicUsername: string;
  basicPassword: string;
  oauthToken: string;
  oauthTokenType: string;
};

export type FormDataFieldRow = {
  id: string;
  key: string;
  kind: 'text' | 'file';
  textValue: string;
  file: File | null;
};

export function defaultAuthConfig(): AuthConfig {
  return {
    type: 'Bearer Token',
    bearerToken: '{{token}}',
    apiKeyKey: 'X-API-Key',
    apiKeyValue: '{{apiKey}}',
    apiKeyAddTo: 'header',
    basicUsername: '{{username}}',
    basicPassword: '{{password}}',
    oauthToken: '{{accessToken}}',
    oauthTokenType: 'Bearer',
  };
}

export function emptyParamRow(): ManualParamRow {
  return {
    id: `param-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: '',
    value: '',
    description: '',
  };
}

export function emptyHeaderRow(): ManualHeaderRow {
  return {
    id: `header-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: '',
    value: '',
  };
}

export function emptyFormDataRow(): FormDataFieldRow {
  return {
    id: `form-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: '',
    kind: 'text',
    textValue: '',
    file: null,
  };
}
