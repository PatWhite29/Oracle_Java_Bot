import { apiFetch } from './api';

export const sprintService = {
  list: (projectId) =>
    apiFetch(`/projects/${projectId}/sprints`)
      .then((data) => data?.content || []),

  get: (projectId, sprintId) =>
    apiFetch(`/projects/${projectId}/sprints/${sprintId}`),

  create: (projectId, data) =>
    apiFetch(`/projects/${projectId}/sprints`, { method: 'POST', body: JSON.stringify(data) }),

  update: (projectId, sprintId, data) =>
    apiFetch(`/projects/${projectId}/sprints/${sprintId}`, { method: 'PUT', body: JSON.stringify(data) }),

  activate: (projectId, sprintId) =>
    apiFetch(`/projects/${projectId}/sprints/${sprintId}/activate`, { method: 'POST' }),

  close: (projectId, sprintId) =>
    apiFetch(`/projects/${projectId}/sprints/${sprintId}/close`, { method: 'POST' }),
};
