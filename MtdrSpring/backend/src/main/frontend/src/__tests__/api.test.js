import { apiFetch, ApiError } from '../services/api';

beforeEach(() => {
  localStorage.clear();
  delete window.location;
  window.location = { href: '' };
});

function mockFetch(status, body, headers = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (key) => headers[key] || null,
    },
    json: () => Promise.resolve(body),
  });
}

test('401 response clears localStorage and redirects to /login', async () => {
  localStorage.setItem('jwt', 'old-token');
  localStorage.setItem('user', '{"id":1}');
  mockFetch(401, {});

  await apiFetch('/projects');

  expect(localStorage.getItem('jwt')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
  expect(window.location.href).toBe('/login');
});

test('non-OK response throws ApiError with correct status', async () => {
  mockFetch(404, { message: 'Not found' });

  await expect(apiFetch('/projects/999')).rejects.toMatchObject({
    name: 'ApiError',
    status: 404,
    message: 'Not found',
  });
});

test('204 response returns null', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    status: 204,
    ok: true,
    headers: { get: () => null },
    json: () => Promise.reject(new Error('no body')),
  });

  const result = await apiFetch('/tasks/1', { method: 'DELETE' });

  expect(result).toBeNull();
});

test('ok response returns parsed JSON', async () => {
  mockFetch(200, { id: 1, projectName: 'Alpha' });

  const result = await apiFetch('/projects/1');

  expect(result).toEqual({ id: 1, projectName: 'Alpha' });
});

test('JWT in localStorage is included as Authorization header', async () => {
  localStorage.setItem('jwt', 'my-token');
  mockFetch(200, {});

  await apiFetch('/projects');

  const calledHeaders = global.fetch.mock.calls[0][1].headers;
  expect(calledHeaders['Authorization']).toBe('Bearer my-token');
});
