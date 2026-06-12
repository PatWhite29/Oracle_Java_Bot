import { apiFetch } from './api';

export const dashboardService = {
  sprintSummary: (projectId, sprintId) => {
    const params = new URLSearchParams();
    if (sprintId) params.set('sprintId', sprintId);
    else params.set('allSprints', 'true');
    return apiFetch(`/projects/${projectId}/dashboard/sprint-summary?${params}`);
  },

  velocity: (projectId, count = 5) =>
    apiFetch(`/projects/${projectId}/dashboard/velocity?sprints=${count}`),

  efficiency: (projectId, sprintId) => {
    const params = new URLSearchParams();
    if (sprintId) params.set('sprintId', sprintId);
    else params.set('allSprints', 'true');
    return apiFetch(`/projects/${projectId}/dashboard/efficiency?${params}`);
  },

  workload: (projectId, sprintId) => {
    const params = new URLSearchParams();
    if (sprintId) params.set('sprintId', sprintId);
    else params.set('allSprints', 'true');
    return apiFetch(`/projects/${projectId}/dashboard/workload?${params}`);
  },

  backlog: (projectId) =>
    apiFetch(`/projects/${projectId}/dashboard/backlog`),

  burndown: (projectId, sprintId) => {
    const q = sprintId ? `?sprintId=${sprintId}` : '';
    return apiFetch(`/projects/${projectId}/dashboard/burndown${q}`);
  },

  blockedTasks: (projectId, sprintId) => {
    const q = new URLSearchParams({ status: 'BLOCKED' });
    if (sprintId) q.set('sprint', sprintId);
    return apiFetch(`/projects/${projectId}/tasks?${q}`).then((d) => d?.content || []);
  },
};
