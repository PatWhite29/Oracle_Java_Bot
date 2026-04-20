import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-40 bg-gray-50 rounded-lg" />; }

export default function HoursPerMember({ sprintId }) {
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
  if (!data?.members?.length)
    return <p className="text-sm text-gray-400">No hours logged yet.</p>;

  const sorted = [...data.members].sort((a, b) => b.actualHours - a.actualHours);
  const max = sorted[0]?.actualHours || 1;

  return (
    <div className="space-y-3">
      {sorted.map((m, i) => (
        <div key={m.userId} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-mono w-4 text-right">{i + 1}</span>
              <span className="font-medium text-gray-700">{m.fullName}</span>
            </div>
            <span className="text-gray-500 tabular-nums">{m.actualHours?.toFixed(1)}h</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 bg-gray-800 rounded-full transition-all"
              style={{ width: `${(m.actualHours / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
