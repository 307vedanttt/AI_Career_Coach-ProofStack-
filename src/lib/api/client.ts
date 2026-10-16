export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanBase && (cleanPath === cleanBase || cleanPath.startsWith(`${cleanBase}/`))) {
    return cleanPath;
  }
  return `${cleanBase}${cleanPath}`;
}

export interface ApiClientOptions extends RequestInit {
  schema?: any;
  params?: Record<string, string | number>;
}

export async function apiClient<T = any>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  let url = buildUrl(endpoint);
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined && v !== null) {
        searchParams.append(k, String(v));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    body: options.body,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText || 'API Request Failed'}`);
  }


  const data = await res.json();
  if (options.schema) {
    const parseResult = options.schema.safeParse(data);
    if (parseResult.success) {
      return parseResult.data;
    }
  }
  return data;
}

apiClient.get = async <T = any>(url: string, init?: ApiClientOptions): Promise<T> => {
  return apiClient<T>(url, { ...init, method: 'GET' });
};

apiClient.post = async <T = any>(url: string, body?: any, init?: ApiClientOptions): Promise<T> => {
  return apiClient<T>(url, {
    ...init,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};
