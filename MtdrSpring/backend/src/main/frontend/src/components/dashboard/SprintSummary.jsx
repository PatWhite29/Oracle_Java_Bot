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

  const STATUS_CFG = [
    { key: 'TODO',        label: 'To Do',       bg: '#FAFAFA', dot: '#6B7280', num: '#374151' },
    { key: 'IN_PROGRESS', label: 'In Progress', bg: '#EFF6FF', dot: '#1D4ED8', num: '#1D4ED8' },
    { key: 'BLOCKED',     label: 'Blocked',     bg: '#FFF5F5', dot: '#C74634', num: '#C74634' },
    { key: 'DONE',        label: 'Done',        bg: '#F0FDF4', dot: '#15803D', num: '#15803D' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_CFG.map(({ key, label, bg, dot, num }) => (
          <div key={key} className="rounded-xl p-3.5 flex flex-col gap-1.5" style={{ background: bg, border: '1px solid #E5E7EB' }}>
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
      <div className="flex flex-wrap gap-4 text-[12px] text-gray-500 pt-1 border-t border-gray-100">
        <span>Committed: <strong className="text-gray-800">{data.spCommitted} SP</strong></span>
        <span>Completed: <strong className="text-gray-800">{data.spCompleted} SP</strong></span>
        <span>Completion: <strong className="text-gray-800">{data.completionPercentage?.toFixed(0)}%</strong></span>
        {data.blockedCount > 0 && (
          <span className="font-semibold" style={{ color: '#C74634' }}>{data.blockedCount} blocked</span>
        )}
      </div>
    </div>
  );
}
