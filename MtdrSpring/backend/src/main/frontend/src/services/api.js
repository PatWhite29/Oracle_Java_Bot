const BASE = '/api/v1';
const DEV = process.env.NODE_ENV === 'development';

export class ApiError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('jwt');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (DEV) {
    console.debug(`[API] ${options.method || 'GET'} ${endpoint}`, options.body ? JSON.parse(options.body) : '');
  }

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
  const requestId = res.headers.get('X-Request-Id');

  if (DEV) {
    console.debug(`[API] ${res.status} ${endpoint}${requestId ? ` (reqId=${requestId})` : ''}`);
  }

  if (res.status === 401) {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message || body.error || msg;
    } catch (_) {}
    if (DEV) {
      console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint} → ${res.status}: ${msg}${requestId ? ` (reqId=${requestId})` : ''}`);
    }
    throw new ApiError(msg, res.status, endpoint);
  }

  if (res.status === 204) return null;
  return res.json();
}
