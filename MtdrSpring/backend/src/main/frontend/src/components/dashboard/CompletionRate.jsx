import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-24 bg-gray-50 rounded-lg" />; }

export default function CompletionRate({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sprintId) { setLoading(false); setData(null); return; }
    setLoading(true);
    dashboardService.sprintSummary(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data) return <p className="text-sm text-gray-400">Select a sprint to view data.</p>;

  const pct = data.completionPercentage ?? 0;
  const color = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 space-y-1">
      <span className={`text-5xl font-bold tabular-nums ${color}`}>{pct.toFixed(0)}%</span>
      <span className="text-xs text-gray-400 uppercase tracking-wide">of SP committed</span>
      <span className="text-xs text-gray-400">{data.spCompleted} / {data.spCommitted} SP done</span>
    </div>
  );
}
