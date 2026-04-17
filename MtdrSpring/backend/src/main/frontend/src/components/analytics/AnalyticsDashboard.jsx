import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ALL_SPRINTS_VALUE, sprintAnalyticsData } from './sprintAnalyticsData';

const CHART_COLORS = ['#c74634', '#5c6ac4', '#2e7d32', '#8e44ad', '#e67e22', '#00897b'];

function safeDivide(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return numerator / denominator;
}

function round(value, digits = 1) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Number(safeValue.toFixed(digits));
}

function formatMetric(value, digits = 1) {
  return round(value, digits).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function getSelectedSprints(selectedSprint) {
  if (selectedSprint === ALL_SPRINTS_VALUE) {
    return sprintAnalyticsData;
  }

  return sprintAnalyticsData.filter((sprint) => sprint.sprint === selectedSprint);
}

function aggregateDeveloperRows(selectedSprints) {
  const rowsByDeveloper = new Map();

  selectedSprints.forEach((sprint) => {
    sprint.developers.forEach((developer) => {
      const current = rowsByDeveloper.get(developer.name) || {
        developer: developer.name,
        completedTasks: 0,
        assignedTasks: 0,
        realHours: 0,
        completedStoryPoints: 0,
        leadTimeHoursTotal: 0,
        leadTimeSamples: 0,
        taskActivityActions: 0,
        botReactionTimeTotal: 0,
        botReactionSamples: 0,
      };

      current.completedTasks += developer.completedTasks || 0;
      current.assignedTasks += developer.assignedTasks || 0;
      current.realHours += developer.realHours || 0;
      current.completedStoryPoints += developer.completedStoryPoints || 0;
      current.leadTimeHoursTotal += developer.leadTimeHours || 0;
      current.leadTimeSamples += 1;
      current.taskActivityActions += developer.taskActivityActions || 0;
      current.botReactionTimeTotal += developer.botReactionTimeMinutes || 0;
      current.botReactionTimeSamples += 1;

      rowsByDeveloper.set(developer.name, current);
    });
  });

  return Array.from(rowsByDeveloper.values())
    .map((row) => ({
      ...row,
      leadTimeHours: safeDivide(row.leadTimeHoursTotal, row.leadTimeSamples),
      botReactionTimeMinutes: safeDivide(row.botReactionTimeTotal, row.botReactionTimeSamples),
      effectiveness: safeDivide(row.completedTasks, row.assignedTasks) * 100,
      workloadScore: row.realHours + row.completedTasks * 2,
    }))
    .sort((left, right) => right.completedTasks - left.completedTasks || right.realHours - left.realHours);
}

function buildKpis(selectedSprints) {
  const allDevelopers = selectedSprints.flatMap((sprint) => sprint.developers);
  const totalDurationDays = selectedSprints.reduce((sum, sprint) => sum + (sprint.durationDays || 0), 0);
  const totalCompletedStoryPoints = allDevelopers.reduce((sum, developer) => sum + (developer.completedStoryPoints || 0), 0);
  const totalLeadTime = allDevelopers.reduce((sum, developer) => sum + (developer.leadTimeHours || 0), 0);
  const totalActivityActions = allDevelopers.reduce((sum, developer) => sum + (developer.taskActivityActions || 0), 0);
  const totalCompletedTasks = allDevelopers.reduce((sum, developer) => sum + (developer.completedTasks || 0), 0);
  const totalAssignedTasks = allDevelopers.reduce((sum, developer) => sum + (developer.assignedTasks || 0), 0);
  const totalBotReactionTime = allDevelopers.reduce((sum, developer) => sum + (developer.botReactionTimeMinutes || 0), 0);
  const activeUsersValues = selectedSprints.map((sprint) => sprint.activeUsers || 0).filter(Boolean);
  const averageActiveUsers = activeUsersValues.length > 0
    ? activeUsersValues.reduce((sum, value) => sum + value, 0) / activeUsersValues.length
    : 0;

  return {
    iev: safeDivide(totalCompletedStoryPoints, totalDurationDays),
    lt: safeDivide(totalLeadTime, allDevelopers.length),
    ec: safeDivide(totalActivityActions, averageActiveUsers),
    ef: safeDivide(totalCompletedTasks, totalAssignedTasks) * 100,
    trb: safeDivide(totalBotReactionTime, allDevelopers.length),
    totalCompletedStoryPoints,
    totalCompletedTasks,
    totalAssignedTasks,
  };
}

function buildTrend(selectedSprints) {
  if (selectedSprints.length < 2) {
    return null;
  }

  const latestSprint = selectedSprints[selectedSprints.length - 1];
  const previousSprint = selectedSprints[selectedSprints.length - 2];

  const latestAvgReaction = safeDivide(
    latestSprint.developers.reduce((sum, developer) => sum + (developer.botReactionTimeMinutes || 0), 0),
    latestSprint.developers.length
  );
  const previousAvgReaction = safeDivide(
    previousSprint.developers.reduce((sum, developer) => sum + (developer.botReactionTimeMinutes || 0), 0),
    previousSprint.developers.length
  );

  return {
    improved: latestAvgReaction <= previousAvgReaction,
    delta: round(Math.abs(latestAvgReaction - previousAvgReaction), 1),
    latestSprint: latestSprint.sprint,
    previousSprint: previousSprint.sprint,
  };
}

function getVariance(values) {
  if (!values.length) {
    return 0;
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - average) ** 2), 0) / values.length;

  return variance;
}

function buildInsights(selectedSprints, developerRows, kpis) {
  const findings = [];
  const recommendations = [];

  const topTasksDeveloper = developerRows[0];
  const topHoursDeveloper = [...developerRows].sort((left, right) => right.realHours - left.realHours)[0];
  const bestEffectivenessDeveloper = [...developerRows].sort((left, right) => right.effectiveness - left.effectiveness)[0];

  if (topTasksDeveloper) {
    findings.push(`${topTasksDeveloper.developer} completed the highest number of tasks in the selected scope.`);
  }

  if (topHoursDeveloper) {
    findings.push(`${topHoursDeveloper.developer} logged the most real hours, which may indicate higher workload.`);
  }

  if (bestEffectivenessDeveloper) {
    findings.push(`${bestEffectivenessDeveloper.developer} has the best delivery effectiveness in the selected sprint.`);
  }

  const hoursValues = developerRows.map((developer) => developer.realHours);
  const avgHours = hoursValues.length > 0 ? hoursValues.reduce((sum, value) => sum + value, 0) / hoursValues.length : 0;
  const maxHours = Math.max(...hoursValues, 0);
  const minHours = hoursValues.length > 0 ? Math.min(...hoursValues) : 0;
  const imbalanceRatio = avgHours > 0 ? (maxHours - minHours) / avgHours : 0;

  if (imbalanceRatio >= 0.35) {
    findings.push('Sprint workload shows a noticeable imbalance across developers.');
    recommendations.push('Redistribute workload across developers.');
  }

  if (kpis.ef < 85) {
    recommendations.push('Optimize sprint planning commitment.');
  }

  if (kpis.ec < 15) {
    recommendations.push('Increase team participation in task activity.');
  }

  if (kpis.iev < 1.8) {
    recommendations.push('Review story point estimation accuracy.');
  }

  if (kpis.lt > 16) {
    recommendations.push('Detect overloaded contributors and review task closure flow.');
  }

  const trend = buildTrend(selectedSprints);
  if (trend) {
    findings.push(
      trend.improved
        ? `Bot reaction time improved compared to ${trend.previousSprint}, by ${formatMetric(trend.delta, 1)} minutes.`
        : `Bot reaction time increased compared to ${trend.previousSprint}, by ${formatMetric(trend.delta, 1)} minutes.`
    );
    if (trend.improved) {
      recommendations.push('Keep the current bot alerting response patterns and monitor the next sprint.');
    } else {
      recommendations.push('Improve response time to blocked tasks.');
    }
  }

  if (findings.length === 0) {
    findings.push('No significant signals found in the selected sprint scope.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain the current delivery rhythm and continue monitoring KPI trends.');
  }

  return {
    findings,
    recommendations,
  };
}

function SprintFilter({ value, options, onChange }) {
  return (
    <label className="analytics-filter-select">
      <span>Sprint</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function KpiCard({ label, value, helper, accent }) {
  return (
    <article className="kpi-card">
      <div className={`kpi-accent ${accent || ''}`} />
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {helper ? <p className="kpi-helper">{helper}</p> : null}
    </article>
  );
}

function BarChartCard({ title, description, unit, data, color }) {
  return (
    <section className="bar-chart-card">
      <div className="bar-chart-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9edf3" vertical={false} />
              <XAxis dataKey="developer" tickLine={false} axisLine={{ stroke: '#dbe2eb' }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#dbe2eb' }} />
              <Tooltip
                cursor={{ fill: 'rgba(199, 70, 52, 0.06)' }}
                formatter={(value) => [`${formatMetric(value, 1)} ${unit}`, title]}
              />
              <Legend />
              <Bar dataKey="value" name={unit === 'tasks' ? 'Completed tasks' : 'Real hours'} radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.developer}`} fill={CHART_COLORS[index % CHART_COLORS.length] || color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state analytics-empty">No data available for the selected sprint.</div>
      )}
    </section>
  );
}

function InsightPanel({ title, items, tone }) {
  return (
    <section className={`insight-panel ${tone || ''}`}>
      <h4>{title}</h4>
      {items.length > 0 ? (
        <ul className="insight-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="empty-state analytics-empty">No information available.</div>
      )}
    </section>
  );
}

function AnalyticsDashboard() {
  const [selectedSprint, setSelectedSprint] = useState(ALL_SPRINTS_VALUE);

  const availableOptions = [ALL_SPRINTS_VALUE, ...sprintAnalyticsData.map((sprint) => sprint.sprint)];

  const selectedSprints = useMemo(() => getSelectedSprints(selectedSprint), [selectedSprint]);

  const developerRows = useMemo(() => aggregateDeveloperRows(selectedSprints), [selectedSprints]);

  const chartDataTasks = useMemo(
    () => developerRows.map((developer) => ({ developer: developer.developer, value: developer.completedTasks })),
    [developerRows]
  );

  const chartDataHours = useMemo(
    () => developerRows.map((developer) => ({ developer: developer.developer, value: developer.realHours })),
    [developerRows]
  );

  const kpis = useMemo(() => buildKpis(selectedSprints), [selectedSprints]);
  const { findings, recommendations } = useMemo(
    () => buildInsights(selectedSprints, developerRows, kpis),
    [selectedSprints, developerRows, kpis]
  );

  const selectedSprintLabel = selectedSprint;
  const topTasksDeveloper = developerRows[0];
  const topHoursDeveloper = [...developerRows].sort((left, right) => right.realHours - left.realHours)[0];
  const bestEffectivenessDeveloper = [...developerRows].sort((left, right) => right.effectiveness - left.effectiveness)[0];
  const hoursVariance = getVariance(developerRows.map((developer) => developer.realHours));
  const isBalanced = hoursVariance < 35;

  return (
    <div className="analytics-shell">
      <section className="analytics-hero card">
        <div className="analytics-hero-copy">
          <span className="eyebrow">Analytics</span>
          <h1>Team Analytics</h1>
          <p>
            Comparative dashboard for developer performance by sprint, with KPI cards, workload signals,
            delivery trends, and a quick visual read for demo sessions.
          </p>
        </div>

        <div className="analytics-hero-note">
          <span className="hero-note-label">Current scope</span>
          <strong>{selectedSprintLabel}</strong>
          <small>
            {selectedSprint === ALL_SPRINTS_VALUE
              ? 'Aggregated view across all available sprints.'
              : 'Filtered to a single sprint for focused analysis.'}
          </small>
        </div>
      </section>

      <section className="card section-card analytics-controls-card">
        <div className="analytics-controls">
          <div>
            <h2>Performance overview</h2>
            <p>Use the sprint filter to recalibrate charts, KPIs, and generated findings.</p>
          </div>
          <SprintFilter value={selectedSprint} options={availableOptions} onChange={setSelectedSprint} />
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard
          label="IEV"
          value={formatMetric(kpis.iev, 2)}
          helper="Story points completed ÷ sprint duration"
          accent="accent-primary"
        />
        <KpiCard
          label="LT"
          value={`${formatMetric(kpis.lt, 1)}h`}
          helper="Average lead time of developers"
          accent="accent-blue"
        />
        <KpiCard
          label="EC"
          value={formatMetric(kpis.ec, 1)}
          helper="Task activity actions ÷ active users"
          accent="accent-success"
        />
        <KpiCard
          label="EF"
          value={`${formatMetric(kpis.ef, 1)}%`}
          helper="Completed tasks ÷ assigned tasks"
          accent="accent-warning"
        />
        <KpiCard
          label="TRB"
          value={`${formatMetric(kpis.trb, 1)} min`}
          helper="Average bot reaction time"
          accent="accent-purple"
        />
      </section>

      <section className="charts-grid">
        <BarChartCard
          title="Tasks completed by developer"
          description="Bar comparison of tasks finished per developer in the selected sprint scope."
          unit="tasks"
          data={chartDataTasks}
          color="#c74634"
        />
        <BarChartCard
          title="Real hours by developer"
          description="Workload distribution based on actual hours logged by each developer."
          unit="hours"
          data={chartDataHours}
          color="#5c6ac4"
        />
      </section>

      <section className="insights-grid">
        <InsightPanel
          title="Key Findings"
          items={findings}
          tone="tone-findings"
        />
        <InsightPanel
          title="Suggested Improvements"
          items={recommendations}
          tone="tone-recommendations"
        />
      </section>

      <section className="card section-card analytics-footer-grid">
        <div>
          <h3>Quick signals</h3>
          <p className="analytics-footer-text">
            Top tasks: {topTasksDeveloper ? topTasksDeveloper.developer : 'N/A'} · Top hours:{' '}
            {topHoursDeveloper ? topHoursDeveloper.developer : 'N/A'} · Best effectiveness:{' '}
            {bestEffectivenessDeveloper ? bestEffectivenessDeveloper.developer : 'N/A'}
          </p>
        </div>
        <div className="analytics-pill-row">
          <span className={`analytics-pill ${isBalanced ? 'pill-good' : 'pill-alert'}`}>
            {isBalanced ? 'Workload looks balanced' : 'Potential workload imbalance'}
          </span>
          <span className="analytics-pill pill-neutral">
            {selectedSprints.length} sprint{selectedSprints.length === 1 ? '' : 's'} selected
          </span>
        </div>
      </section>
    </div>
  );
}

export default AnalyticsDashboard;
