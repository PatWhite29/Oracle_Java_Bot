import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-20 bg-gray-50 rounded-lg" />; }

export default function BacklogSummary() {
  const { project } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.backlog(project.id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data) return <p className="text-sm text-gray-400">No backlog data.</p>;

  const byPriority = data.byPriority || {};
  const priorities = ['HIGH', 'MEDIUM', 'LOW', 'NONE']
    .map((p) => ({ label: p, count: byPriority[p] || 0 }))
    .filter((p) => p.count > 0);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div>
        <p className="text-3xl font-display font-extrabold text-navy tabular-nums leading-none">{data.totalTasks}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Tasks</p>
      </div>
      <div>
        <p className="text-3xl font-display font-extrabold text-navy tabular-nums leading-none">{data.totalStoryPoints}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Story points</p>
      </div>
      {priorities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {priorities.map(({ label, count }) => (
            <div key={label} className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: '#F5F7FA', border: '1px solid #E5E7EB' }}>
              <Badge value={label} />
              <span className="text-[12px] font-bold text-gray-700">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
