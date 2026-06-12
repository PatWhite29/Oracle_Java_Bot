import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() {
  return <div className="animate-pulse h-28 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />;
}

export default function SprintSummary({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    dashboardService.sprintSummary(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data) return null;

  const counts = data.statusCounts || {};

  const STATUS_CFG = [
    { key: 'TODO',        label: 'To Do',       bg: 'var(--status-todo-bg)',     dot: 'var(--status-todo-dot)',     num: 'var(--status-todo-text)' },
    { key: 'IN_PROGRESS', label: 'In Progress', bg: 'var(--status-ip-bg)',       dot: 'var(--status-ip-dot)',       num: 'var(--status-ip-text)' },
    { key: 'BLOCKED',     label: 'Blocked',     bg: 'var(--status-blocked-bg)',  dot: 'var(--status-blocked-dot)',  num: 'var(--status-blocked-text)' },
    { key: 'DONE',        label: 'Done',        bg: 'var(--status-done-bg)',     dot: 'var(--status-done-dot)',     num: 'var(--status-done-text)' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_CFG.map(({ key, label, bg, dot, num }) => (
          <div key={key} className="rounded-xl p-3.5 flex flex-col gap-1.5" style={{ background: bg, border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dot }}>{label}</span>
            </div>
            <p className="text-3xl font-display font-extrabold tabular-nums leading-none" style={{ color: num }}>
              {counts[key] ?? 0}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-[12px] pt-1" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
        <span>Committed: <strong style={{ color: 'var(--text-primary)' }}>{data.spCommitted} SP</strong></span>
        <span>Completed: <strong style={{ color: 'var(--text-primary)' }}>{data.spCompleted} SP</strong></span>
        <span>Completion: <strong style={{ color: 'var(--text-primary)' }}>{data.completionPercentage?.toFixed(0)}%</strong></span>
        {data.blockedCount > 0 && (
          <span className="font-semibold" style={{ color: 'var(--status-blocked-dot)' }}>{data.blockedCount} blocked</span>
        )}
      </div>
    </div>
  );
}
