import { apiFetch } from './api';

export const taskService = {
  list: (projectId, params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') q.set(k, v); });
    return apiFetch(`/projects/${projectId}/tasks?${q}`);
  },

  get: (projectId, taskId) =>
    apiFetch(`/projects/${projectId}/tasks/${taskId}`),

  create: (projectId, data) =>
    apiFetch(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),

  update: (projectId, taskId, data) =>
    apiFetch(`/projects/${projectId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (projectId, taskId) =>
    apiFetch(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),

  changeStatus: (projectId, taskId, status, actualHours) =>
    apiFetch(`/projects/${projectId}/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...(actualHours != null ? { actualHours } : {}) }),
    }),

  changeSprint: (projectId, taskId, sprintId) =>
    apiFetch(`/projects/${projectId}/tasks/${taskId}/sprint`, {
      method: 'PATCH',
      body: JSON.stringify({ sprintId }),
    }),

  getActivities: (projectId, taskId) =>
    apiFetch(`/projects/${projectId}/tasks/${taskId}/activity`)
      .then((data) => data?.content || []),

  addComment: (projectId, taskId, content) =>
    apiFetch(`/projects/${projectId}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};
