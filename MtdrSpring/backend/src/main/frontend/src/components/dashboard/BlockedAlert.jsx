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
      <div className="flex flex-col items-center justify-center h-full py-4 gap-1">
        <span className="text-5xl font-display font-extrabold" style={{ color: '#15803D' }}>0</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">blocked tasks</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-4xl font-display font-extrabold tabular-nums leading-none" style={{ color: '#C74634' }}>
          {tasks.length}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C74634' }}>blocked</span>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-2 rounded-lg px-3 py-2" style={{ background: '#FFF5F5', border: '1px solid #FEE2E2' }}>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 truncate">{t.taskName}</p>
              {t.assignedTo && (
                <p className="text-[11px] text-gray-400 truncate">{t.assignedTo.fullName}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
