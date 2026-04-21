import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-24 bg-red-50 rounded-lg" />; }

export default function BlockedAlert({ sprintId }) {
  const { project } = useProject();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sprintId) { setLoading(false); setTasks([]); return; }
    setLoading(true);
    dashboardService.blockedTasks(project.id, sprintId)
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 space-y-1">
        <span className="text-5xl font-bold text-green-500">0</span>
        <span className="text-xs text-gray-400 uppercase tracking-wide">blocked tasks</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-red-500 tabular-nums">{tasks.length}</span>
        <span className="text-xs text-red-400 uppercase tracking-wide font-medium">blocked</span>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-2 bg-red-50 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{t.taskName}</p>
              {t.assignedTo && (
                <p className="text-xs text-gray-400 truncate">{t.assignedTo.fullName}</p>
              )}
            </div>
            <span className="shrink-0 text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
              {t.sprint?.sprintName ?? 'Backlog'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
