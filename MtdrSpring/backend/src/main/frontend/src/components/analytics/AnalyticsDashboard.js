import React, { useEffect, useMemo, useState } from 'react';
import GroupedBarChart from './GroupedBarChart';
import { fetchAccessibleProjects, fetchAnalyticsPayload } from '../../services/analyticsApi';

function formatNumber(value, digits = 0) {
  return Number(value || 0).toFixed(digits);
}

function MetricsCard({ label, value, helper }) {
  return (
    <div className="analytics-metric-card">
      <span className="analytics-metric-label">{label}</span>
      <strong className="analytics-metric-value">{value}</strong>
      {helper && <small className="analytics-metric-helper">{helper}</small>}
    </div>
  );
}

function AnalyticsDashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sprintFilter, setSprintFilter] = useState('All sprints');
  const [tasksBySprint, setTasksBySprint] = useState([]);
  const [hoursBySprint, setHoursBySprint] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState({});
  const [availableSprints, setAvailableSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const projectList = await fetchAccessibleProjects();

        if (cancelled) {
          return;
        }

        setProjects(projectList || []);

        if (projectList && projectList.length > 0) {
          setSelectedProjectId(String(projectList[0].id));
        } else {
          setError('No data available');
          setLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Unable to load projects');
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchAnalyticsPayload(selectedProjectId, sprintFilter)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setSummary(payload.summary || {});
        setTasksBySprint(payload.tasksBySprint || []);
        setHoursBySprint(payload.hoursBySprint || []);
        setInsights(payload.insights || {});

        const sprintOptions = payload.summary && payload.summary.sprintOptions ? payload.summary.sprintOptions : [];
        setAvailableSprints(sprintOptions);

        const sprintIds = sprintOptions.map((sprint) => String(sprint.id));
        if (sprintFilter !== 'All sprints' && sprintIds.indexOf(String(sprintFilter)) === -1) {
          setSprintFilter('All sprints');
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError.message || 'Unable to load analytics data');
          setTasksBySprint([]);
          setHoursBySprint([]);
          setSummary(null);
          setInsights({});
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, sprintFilter]);

  const selectedSprintLabel = useMemo(() => {
    if (sprintFilter === 'All sprints') {
      return 'All sprints';
    }

    const selectedSprint = availableSprints.find((sprint) => String(sprint.id) === String(sprintFilter));
    return selectedSprint && selectedSprint.label ? selectedSprint.label : 'Selected sprint';
  }, [availableSprints, sprintFilter]);

  const filteredTasks = useMemo(
    () => (sprintFilter === 'All sprints' ? tasksBySprint : tasksBySprint.filter((row) => row.sprint === selectedSprintLabel)),
    [tasksBySprint, sprintFilter, selectedSprintLabel]
  );
  const filteredHours = useMemo(
    () => (sprintFilter === 'All sprints' ? hoursBySprint : hoursBySprint.filter((row) => row.sprint === selectedSprintLabel)),
    [hoursBySprint, sprintFilter, selectedSprintLabel]
  );

  const hasData = filteredTasks.length > 0 || filteredHours.length > 0;

  const topTasksSource = insights.topPerformerByTasks || summary?.topTaskPerformer;
  const topHoursSource = insights.topPerformerByHours || summary?.topHourPerformer;
  const topTasksText = topTasksSource
    ? `${topTasksSource.developerName} completed ${topTasksSource.completedTasks} tasks.`
    : 'No top performer data available.';
  const topHoursText = topHoursSource
    ? `${topHoursSource.developerName} invested ${formatNumber(topHoursSource.realHours, 1)} hours.`
    : 'No hours data available.';
  const efficiencySource = insights.bestEfficiency || summary?.bestEfficiency;
  const efficiencyText = efficiencySource
    ? `${efficiencySource.developerName} achieved the best ratio with ${formatNumber(efficiencySource.efficiencyRatio, 2)} tasks/hour.`
    : 'No efficiency data available.';

  const selectedProject = projects.find((project) => String(project.id) === String(selectedProjectId));
  const keyFindings = (summary && summary.keyFindings && summary.keyFindings.length > 0)
    ? summary.keyFindings
    : (insights.keyFindings || []);
  const recommendations = (summary && summary.recommendations && summary.recommendations.length > 0)
    ? summary.recommendations
    : (insights.recommendations || []);

  return (
    <section className="card section-card analytics-section">
      <div className="section-header analytics-header">
        <div>
          <span className="eyebrow">Insights</span>
          <h2>Team Analytics</h2>
          <p>Compare developer throughput, effort, and balance by project and sprint.</p>
        </div>

        <div className="analytics-toolbar">
          <label className="analytics-filter">
            <span>Project</span>
            <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
              {projects.length === 0 && <option value="">No projects available</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.label || project.projectName || `Project ${project.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="analytics-filter">
            <span>Sprint</span>
            <select value={sprintFilter} onChange={(event) => setSprintFilter(event.target.value)}>
              <option value="All sprints">All sprints</option>
              {availableSprints.map((sprint) => (
                <option key={sprint.id} value={String(sprint.id)}>
                  {sprint.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading && (
        <div className="analytics-loading-shell">
          <div className="analytics-loading-card">
            <span className="loading-bar" />
            <span className="loading-bar short" />
            <span className="loading-bar medium" />
          </div>
          <div className="analytics-loading-card">
            <span className="loading-bar" />
            <span className="loading-bar short" />
            <span className="loading-bar medium" />
          </div>
        </div>
      )}

      {!loading && error && <div className="analytics-error">{error}</div>}

      {!loading && !error && (
        <>
          {!hasData ? (
            <div className="empty-state analytics-empty">No data available</div>
          ) : (
            <>
              <div className="analytics-summary-grid">
                <MetricsCard
                  label="Total tasks done"
                  value={summary ? summary.totalTasksDone : '0'}
                  helper={selectedProject ? selectedProject.label || selectedProject.projectName : 'No project selected'}
                />
                <MetricsCard
                  label="Total real hours"
                  value={summary ? formatNumber(summary.totalRealHours, 2) : '0.00'}
                  helper={selectedSprintLabel}
                />
                <MetricsCard label="Best efficiency" value={efficiencyText} />
                <MetricsCard label="Most loaded developer" value={summary?.mostLoadedDeveloper?.developerName || 'N/A'} />
                <MetricsCard label="Selected sprint" value={selectedSprintLabel} helper={summary?.hasBacklog ? 'Backlog included only in all-sprints view' : ''} />
              </div>

              <div className="analytics-grid">
                <GroupedBarChart
                  title="Completed Tasks by Developer / Sprint"
                  description="Count of tasks completed per developer, grouped by sprint."
                  rows={filteredTasks}
                  loading={loading}
                  emptyMessage="No data available"
                  unit="tasks"
                />
                <GroupedBarChart
                  title="Real Hours by Developer / Sprint"
                  description="Total real hours spent per developer, grouped by sprint."
                  rows={filteredHours}
                  loading={loading}
                  emptyMessage="No data available"
                  unit="hours"
                />
              </div>

              <div className="analytics-panels-grid">
                <div className="card analytics-panel">
                  <div className="analytics-card-header">
                    <div>
                      <h3>Key Findings</h3>
                      <p>Automatically generated observations from the selected scope.</p>
                    </div>
                  </div>
                  {keyFindings.length > 0 ? (
                    <ul className="analytics-list">
                      {keyFindings.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state analytics-empty">No key findings available</div>
                  )}
                </div>

                <div className="card analytics-panel">
                  <div className="analytics-card-header">
                    <div>
                      <h3>Suggested Improvements</h3>
                      <p>Actionable recommendations for Scrum Master or Team Lead.</p>
                    </div>
                  </div>
                  {recommendations.length > 0 ? (
                    <ul className="analytics-list analytics-recommendations">
                      {recommendations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state analytics-empty">No recommendations available</div>
                  )}
                </div>
              </div>

              <div className="analytics-detail-grid">
                <div className="analytics-detail-card">
                  <h4>Top performer by tasks</h4>
                  <p>{topTasksText}</p>
                </div>

                <div className="analytics-detail-card">
                  <h4>Top performer by hours</h4>
                  <p>{topHoursText}</p>
                </div>

                <div className="analytics-detail-card">
                  <h4>Sprint Imbalances</h4>
                  {insights.sprintImbalances && insights.sprintImbalances.length > 0 ? (
                    <ul className="analytics-mini-list">
                      {insights.sprintImbalances.map((item) => (
                        <li key={item.sprintId || item.sprintName}>
                          <strong>{item.sprintName || 'Sprint'}</strong>
                          <span>
                            Dispersion {formatNumber((item.dispersionIndex || 0) * 100, 0)}% · Avg hours {formatNumber(item.averageRealHours, 1)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="analytics-muted">No sprint imbalances detected.</p>
                  )}
                </div>

                <div className="analytics-detail-card">
                  <h4>Blocked Task Patterns</h4>
                  {insights.blockedTaskPatterns && insights.blockedTaskPatterns.length > 0 ? (
                    <ul className="analytics-mini-list">
                      {insights.blockedTaskPatterns.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="analytics-muted">No blocked-task concentration detected.</p>
                  )}
                </div>
              </div>

              <div className="analytics-detail-grid">
                <div className="analytics-detail-card">
                  <h4>Overloaded Users</h4>
                  {insights.overloadedUsers && insights.overloadedUsers.length > 0 ? (
                    <ul className="analytics-mini-list">
                      {insights.overloadedUsers.map((user) => (
                        <li key={user.developerId || user.developerName}>
                          <strong>{user.developerName}</strong>
                          <span>{formatNumber(user.value, 2)} compared with average {formatNumber(user.averageValue, 2)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="analytics-muted">No overloaded users detected.</p>
                  )}
                </div>

                <div className="analytics-detail-card">
                  <h4>Underutilized Users</h4>
                  {insights.underutilizedUsers && insights.underutilizedUsers.length > 0 ? (
                    <ul className="analytics-mini-list">
                      {insights.underutilizedUsers.map((user) => (
                        <li key={user.developerId || user.developerName}>
                          <strong>{user.developerName}</strong>
                          <span>{formatNumber(user.value, 2)} compared with average {formatNumber(user.averageValue, 2)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="analytics-muted">No underutilized users detected.</p>
                  )}
                </div>

                <div className="analytics-detail-card">
                  <h4>Scope</h4>
                  <p className="analytics-muted">
                    Project: {selectedProject ? (selectedProject.label || selectedProject.projectName) : 'N/A'}
                  </p>
                  <p className="analytics-muted">Sprint filter: {selectedSprintLabel}</p>
                  <p className="analytics-muted">Backlog tasks are shown only in all-sprints view.</p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

export default AnalyticsDashboard;
