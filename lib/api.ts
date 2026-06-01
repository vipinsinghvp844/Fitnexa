export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const baseHeaders = {
  Accept: 'application/json',
};

type QueryValue = string | number | boolean | null | undefined;

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.accessToken;
    }
  } catch {
    return null;
  }
  return null;
}

export async function request(path: string, options: RequestInit = {}, query?: Record<string, QueryValue>) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...baseHeaders,
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Handle Maintenance Mode
    if (response.status === 503 && typeof window !== 'undefined') {
      if (window.location.pathname !== '/maintenance') {
        window.location.href = '/maintenance';
      }
      throw new ApiError('Platform is under maintenance.', 503);
    }

    // Handle Unauthorized errors by redirecting to login (skip for login endpoint itself to allow error display)
    if (response.status === 401 && typeof window !== 'undefined' && !path.includes('/api/login')) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    if (isJson && payload && typeof payload === 'object' && 'message' in payload) {
      if ((payload as any).error === 'subscription_expired' && typeof window !== 'undefined') {
        if (!window.location.pathname.startsWith('/gym/subscription')) {
          window.location.href = '/gym/subscription';
        }
      }
      throw new ApiError(String(payload.message), response.status, payload);
    }

    if (typeof payload === 'string' && payload.trim()) {
      const message = payload.trim().startsWith('<')
        ? `Request failed with ${response.status} ${response.statusText}`
        : payload.trim();

      throw new ApiError(message, response.status, payload);
    }

    throw new ApiError('Request failed', response.status);
  }

  if (!isJson) {
    throw new ApiError('Server returned a non-JSON response.', response.status, payload);
  }

  return payload;
}

export function login(payload: { email: string; password: string }) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: { 
  gym_name?: string; 
  name: string; 
  email: string; 
  phone?: string;
  address?: string; 
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  password: string; 
  password_confirmation: string;
}) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout(payload: { refresh_token: string }) {
  return request('/api/logout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refresh(payload: { refresh_token: string }) {
  return request('/api/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(payload: { email: string }) {
  return request('/api/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload: { email: string; token: string; password: string; password_confirmation: string }) {
  return request('/api/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function me() {
  return request('/api/me', {
    method: 'GET',
  });
}

export function getPublicGyms(query?: { search?: string; latitude?: number; longitude?: number; radius?: number }) {
  return request('/api/gyms', { method: 'GET' }, query as any);
}

export function getPublicGym(slug: string) {
  return request(`/api/gyms/${slug}`, { method: 'GET', cache: 'no-store' } as RequestInit);
}

export function submitPublicFeedback(slug: string, payload: { name: string; rating: number; text: string }) {
  return request(`/api/gyms/${slug}/feedback`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function subscribePublicPlan(slug: string, payload: { name: string; email: string; phone: string; plan_name: string; password: string }) {
  return request(`/api/gyms/${slug}/subscribe`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getPublicPlatformConfig() {
  return request('/api/platform/config', { method: 'GET' });
}
