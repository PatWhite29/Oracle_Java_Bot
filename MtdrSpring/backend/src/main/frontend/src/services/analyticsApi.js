const USER_ID_STORAGE_KEY = 'oracle-java-bot-user-id';
const DEFAULT_USER_ID = '1';

function getCurrentUserId() {
  if (typeof window === 'undefined') {
    return DEFAULT_USER_ID;
  }

  try {
    return window.localStorage.getItem(USER_ID_STORAGE_KEY) || DEFAULT_USER_ID;
  } catch (error) {
    return DEFAULT_USER_ID;
  }
}

function buildQueryString(params) {
  const query = new URLSearchParams();

  Object.keys(params || {}).forEach((key) => {
    const value = params[key];

    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getCurrentUserId(),
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load analytics data from ${url}`);
  }

  return response.json();
}

function mapMetricsToRows(metrics, valueKey) {
  return (metrics || []).map((item) => ({
    assignee: item.developerName || 'Unassigned',
    sprint: item.sprintName || 'Backlog',
    value: Number(item[valueKey] || 0),
  }));
}

export async function fetchAccessibleProjects() {
  return fetchJson('/api/projects/accessible');
}

export async function fetchAnalyticsPayload(projectId, sprintFilter) {
  const sprintId = sprintFilter && sprintFilter !== 'All sprints' ? sprintFilter : null;
  const query = buildQueryString({ sprintId });
  const [summary, insights] = await Promise.all([
    fetchJson(`/api/projects/${projectId}/analytics/summary${query}`),
    fetchJson(`/api/projects/${projectId}/analytics/insights${query}`),
  ]);

  return {
    summary: summary || {},
    insights: insights || {},
    tasksBySprint: mapMetricsToRows(summary && summary.taskMetrics, 'completedTasks'),
    hoursBySprint: mapMetricsToRows(summary && summary.realHoursMetrics, 'realHours'),
  };
}
