import React, { useMemo } from 'react';

const FALLBACK_COLORS = ['#c74634', '#4f6bed', '#2f8f83', '#8e63d6', '#f59e0b', '#14b8a6'];

function formatValue(value, unit) {
  if (unit === 'hours') {
    return Number(value).toFixed(1);
  }

  return Number(value).toFixed(0);
}

function GroupedBarChart({ title, description, rows, loading, emptyMessage, unit = 'tasks' }) {
  const chartData = useMemo(() => {
    const categories = Array.from(new Set((rows || []).map((item) => item.assignee))).sort();
    const series = Array.from(new Set((rows || []).map((item) => item.sprint))).sort();

    const matrix = categories.map((category) => {
      const values = {};
      series.forEach((sprint) => {
        values[sprint] = 0;
      });

      rows
        .filter((item) => item.assignee === category)
        .forEach((item) => {
          values[item.sprint] = item.value;
        });

      return { category, values };
    });

    const maxValue = Math.max(1, ...(rows || []).map((item) => Number(item.value) || 0));

    return { categories, series, matrix, maxValue };
  }, [rows]);

  if (loading) {
    return (
      <section className="card analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
        <div className="chart-loading">
          <span className="loading-bar" />
          <span className="loading-bar short" />
          <span className="loading-bar medium" />
        </div>
      </section>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <section className="card analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
        <div className="empty-state analytics-empty">{emptyMessage || 'No data available'}</div>
      </section>
    );
  }

  return (
    <section className="card analytics-card">
      <div className="analytics-card-header">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
      </div>

      <div className="chart-legend" aria-label="Chart legend">
        {chartData.series.map((seriesName, index) => (
          <span key={seriesName} className="chart-legend-item">
            <i
              className="chart-legend-swatch"
              style={{ backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
            />
            {seriesName}
          </span>
        ))}
      </div>

      <div className="chart-scroll">
        <div className="grouped-bar-chart" style={{ minWidth: `${Math.max(100, chartData.categories.length * 160)}px` }}>
          {chartData.matrix.map((entry) => (
            <div key={entry.category} className="chart-column">
              <div className="chart-bars">
                {chartData.series.map((seriesName, index) => {
                  const value = Number(entry.values[seriesName] || 0);
                  const barHeight = `${Math.max(6, (value / chartData.maxValue) * 100)}%`;

                  return (
                    <div key={seriesName} className="bar-stack">
                      <div className="bar-value">{formatValue(value, unit)}</div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          title={`${entry.category} · ${seriesName}: ${formatValue(value, unit)}`}
                          style={{
                            height: barHeight,
                            backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                          }}
                        />
                      </div>
                      <div className="bar-series-label">{seriesName}</div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-category-label">{entry.category}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-footnote">
        X axis: developer · Y axis: {unit === 'hours' ? 'real hours' : 'completed tasks'}
      </div>
    </section>
  );
}

export default GroupedBarChart;
