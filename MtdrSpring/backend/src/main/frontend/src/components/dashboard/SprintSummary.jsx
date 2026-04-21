import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() {
  return <div className="animate-pulse h-28 bg-gray-50 rounded-lg" />;
}

export default function SprintSummary({ sprintId }) {
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

  const counts = data.statusCounts || {};
  const statuses = [
    { key: 'TODO', label: 'TODO' },
    { key: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { key: 'BLOCKED', label: 'BLOCKED' },
    { key: 'DONE', label: 'DONE' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{data.sprintName}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statuses.map(({ key }) => (
          <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
            <Badge value={key} />
            <p className="text-2xl font-bold text-gray-800 mt-2">{counts[key] ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
        <span>Committed: <strong>{data.spCommitted} SP</strong></span>
        <span>Completed: <strong>{data.spCompleted} SP</strong></span>
        <span>Completion: <strong>{data.completionPercentage?.toFixed(0)}%</strong></span>
        {data.blockedCount > 0 && (
          <span className="text-red-500 font-medium">{data.blockedCount} blocked</span>
        )}
      </div>
    </div>
  );
}
