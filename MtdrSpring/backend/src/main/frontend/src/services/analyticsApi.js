const USER_ID_STORAGE_KEY = 'oracle-java-bot-user-id';
const DEFAULT_USER_ID = '1';
const USE_DUMMY_ANALYTICS = true;

const DUMMY_PROJECTS = [
  {
    id: 999,
    label: 'Oracle Java Bot (Demo)',
    status: 'ACTIVE',
  },
];

const DUMMY_METRICS = [
  { developerName: 'Carlos Vega', sprintName: 'Sprint 1', completedTasks: 5, realHours: 11.5 },
  { developerName: 'Ana Torres', sprintName: 'Sprint 1', completedTasks: 4, realHours: 9.2 },
  { developerName: 'Luis García', sprintName: 'Sprint 1', completedTasks: 3, realHours: 7.4 },
  { developerName: 'Sofía Rojas', sprintName: 'Sprint 1', completedTasks: 2, realHours: 6.1 },
  { developerName: 'Carlos Vega', sprintName: 'Sprint 2', completedTasks: 6, realHours: 12.8 },
  { developerName: 'Ana Torres', sprintName: 'Sprint 2', completedTasks: 5, realHours: 10.4 },
  { developerName: 'Luis García', sprintName: 'Sprint 2', completedTasks: 4, realHours: 8.6 },
  { developerName: 'Sofía Rojas', sprintName: 'Sprint 2', completedTasks: 3, realHours: 7.2 },
  { developerName: 'Carlos Vega', sprintName: 'Sprint 3', completedTasks: 4, realHours: 9.8 },
  { developerName: 'Ana Torres', sprintName: 'Sprint 3', completedTasks: 6, realHours: 11.3 },
  { developerName: 'Luis García', sprintName: 'Sprint 3', completedTasks: 5, realHours: 9.9 },
  { developerName: 'Sofía Rojas', sprintName: 'Sprint 3', completedTasks: 3, realHours: 8.1 },
];

const DUMMY_SUMMARY = {
  projectId: 999,
  projectName: 'Oracle Java Bot (Demo)',
  totalTasksDone: 50,
  totalRealHours: 112.3,
  hasBacklog: true,
  sprintOptions: [
    { id: 1, label: 'Sprint 1' },
    { id: 2, label: 'Sprint 2' },
    { id: 3, label: 'Sprint 3' },
  ],
  keyFindings: [
    'Ana Torres lidera en throughput durante Sprint 3.',
    'Carlos Vega mantiene alta carga en Sprint 1 y 2.',
    'Existe dispersión de horas entre developers en Sprint 2.',
  ],
  recommendations: [
    'Rebalancear carga en Sprint 2.',
    'Asignar tareas de soporte a perfiles con menor ocupación.',
    'Monitorear tareas bloqueadas en refinamiento semanal.',
  ],
  mostLoadedDeveloper: {
    developerName: 'Carlos Vega',
  },
  topTaskPerformer: {
    developerName: 'Ana Torres',
    completedTasks: 15,
  },
  topHourPerformer: {
    developerName: 'Carlos Vega',
    realHours: 34.1,
  },
  bestEfficiency: {
    developerName: 'Luis García',
    efficiencyRatio: 0.52,
  },
};

const DUMMY_INSIGHTS = {
  topPerformerByTasks: {
    developerName: 'Ana Torres',
    completedTasks: 15,
  },
  topPerformerByHours: {
    developerName: 'Carlos Vega',
    realHours: 34.1,
  },
  bestEfficiency: {
    developerName: 'Luis García',
    efficiencyRatio: 0.52,
  },
  sprintImbalances: [
    {
      sprintId: 2,
      sprintName: 'Sprint 2',
      dispersionIndex: 0.48,
      averageRealHours: 9.75,
    },
  ],
  blockedTaskPatterns: [
    'Sprint 2 tiene concentración de bloqueos en tareas backend.',
  ],
  keyFindings: DUMMY_SUMMARY.keyFindings,
  recommendations: DUMMY_SUMMARY.recommendations,
};

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
  if (USE_DUMMY_ANALYTICS) {
    return DUMMY_PROJECTS;
  }

  return fetchJson('/api/projects/accessible');
}

export async function fetchAnalyticsPayload(projectId, sprintFilter) {
  if (USE_DUMMY_ANALYTICS) {
    const selectedSprint = sprintFilter && sprintFilter !== 'All sprints' ? String(sprintFilter) : null;
    const filteredMetrics = selectedSprint
      ? DUMMY_METRICS.filter((item) => item.sprintName === `Sprint ${selectedSprint}`)
      : DUMMY_METRICS;

    return {
      summary: DUMMY_SUMMARY,
      insights: DUMMY_INSIGHTS,
      tasksBySprint: mapMetricsToRows(filteredMetrics, 'completedTasks'),
      hoursBySprint: mapMetricsToRows(filteredMetrics, 'realHours'),
    };
  }

  const sprintId = sprintFilter && sprintFilter !== 'All sprints' ? sprintFilter : null;
  const query = buildQueryString({ sprintId });
  const [tasksMetrics, hoursMetrics, summary, insights] = await Promise.all([
    fetchJson(`/api/projects/${projectId}/analytics/tasks-completed-by-user-sprint${query}`),
    fetchJson(`/api/projects/${projectId}/analytics/real-hours-by-user-sprint${query}`),
    fetchJson(`/api/projects/${projectId}/analytics/summary${query}`),
    fetchJson(`/api/projects/${projectId}/analytics/insights${query}`),
  ]);

  return {
    summary: summary || {},
    insights: insights || {},
    tasksBySprint: mapMetricsToRows(tasksMetrics, 'completedTasks'),
    hoursBySprint: mapMetricsToRows(hoursMetrics, 'realHours'),
  };
}
