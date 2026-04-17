import { apiFetch } from './api';

export const memberService = {
  list: (projectId) =>
    apiFetch(`/projects/${projectId}/members`)
      .then((data) => (data?.content || []).map((m) => m.employee)),

  add: (projectId, email) =>
    apiFetch('/users/search?email=' + encodeURIComponent(email))
      .then((user) =>
        apiFetch(`/projects/${projectId}/members`, {
          method: 'POST',
          body: JSON.stringify({ userId: user.id }),
        })
      ),

  remove: (projectId, userId) =>
    apiFetch(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
};
