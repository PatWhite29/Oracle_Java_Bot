import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-24 bg-gray-50 rounded-lg" />; }

export default function AvgHoursPerSP({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dashboardService.efficiency(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data || data.totalSpCompleted === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 space-y-1">
        <span className="text-4xl font-bold text-gray-300">—</span>
        <span className="text-xs text-gray-400">No completed tasks yet</span>
      </div>
    );

  const avg = data.totalSpCompleted > 0
    ? (data.totalActualHours / data.totalSpCompleted).toFixed(2)
    : '—';

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 space-y-1">
      <span className="text-5xl font-bold tabular-nums text-gray-800">{avg}</span>
      <span className="text-xs text-gray-400 uppercase tracking-wide">hours per story point</span>
      <span className="text-xs text-gray-400">{data.totalActualHours?.toFixed(1)}h · {data.totalSpCompleted} SP done</span>
    </div>
  );
}
