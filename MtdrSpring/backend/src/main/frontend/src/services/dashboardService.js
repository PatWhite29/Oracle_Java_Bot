import { apiFetch } from './api';

export const dashboardService = {
  sprintSummary: (projectId, sprintId) =>
    apiFetch(`/projects/${projectId}/dashboard/sprint-summary${sprintId ? `?sprintId=${sprintId}` : ''}`),

  velocity: (projectId, sprintId) =>
    apiFetch(`/projects/${projectId}/dashboard/velocity${sprintId ? `?sprintId=${sprintId}` : ''}`),

  burndown: (projectId, sprintId) =>
    apiFetch(`/projects/${projectId}/dashboard/burndown${sprintId ? `?sprintId=${sprintId}` : ''}`),

  workload: (projectId, sprintId) =>
    apiFetch(`/projects/${projectId}/dashboard/workload${sprintId ? `?sprintId=${sprintId}` : ''}`),

  backlog: (projectId) =>
    apiFetch(`/projects/${projectId}/dashboard/backlog`),
};
