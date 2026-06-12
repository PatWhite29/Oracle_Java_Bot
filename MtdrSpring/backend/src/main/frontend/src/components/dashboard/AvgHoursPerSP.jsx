import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-24 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />; }

export default function AvgHoursPerSP({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    dashboardService.efficiency(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data || data.totalSpCompleted === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 gap-1">
        <span className="text-4xl font-display font-extrabold" style={{ color: 'var(--border-strong)' }}>—</span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>No completed tasks yet</span>
      </div>
    );

  const avg = (data.totalActualHours / data.totalSpCompleted).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 gap-1">
      <span className="text-5xl font-display font-extrabold tabular-nums leading-none text-navy">{avg}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>hours per story point</span>
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{data.totalActualHours?.toFixed(1)}h · {data.totalSpCompleted} SP done</span>
    </div>
  );
}
