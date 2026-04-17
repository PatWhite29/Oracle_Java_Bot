import { apiFetch } from './api';

export const projectService = {
  list: (page = 0, size = 20) =>
    apiFetch(`/projects?page=${page}&size=${size}`),

  get: (projectId) =>
    apiFetch(`/projects/${projectId}`),

  create: (data) =>
    apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) }),

  update: (projectId, data) =>
    apiFetch(`/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (projectId) =>
    apiFetch(`/projects/${projectId}`, { method: 'DELETE' }),

  confirmClose: (projectId) =>
    apiFetch(`/projects/${projectId}/close`, { method: 'POST' }),
};
