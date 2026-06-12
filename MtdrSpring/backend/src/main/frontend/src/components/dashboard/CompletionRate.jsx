import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-24 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />; }

export default function CompletionRate({ sprintId }) {
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

  const pct = data.completionPercentage ?? 0;
  const color = pct >= 80 ? '#15803D' : pct >= 50 ? '#003865' : '#C74634';

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 gap-1">
      <span className="text-5xl font-display font-extrabold tabular-nums leading-none" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>of SP committed</span>
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{data.spCompleted} / {data.spCommitted} SP done</span>
    </div>
  );
}
