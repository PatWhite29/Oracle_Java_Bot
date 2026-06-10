import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() {
  return <div className="animate-pulse h-24 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function MiniKpi({ label, value, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 gap-1">
      <span className="text-5xl font-display font-extrabold tabular-nums leading-none text-navy">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {sub && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  );
}

export default function KpiDevStats({ sprintId }) {
  const { project } = useProject();
  const [effData, setEffData] = useState(null);
  const [wkData, setWkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      dashboardService.efficiency(project.id, sprintId),
      dashboardService.workload(project.id, sprintId),
    ])
      .then(([eff, wk]) => { setEffData(eff); setWkData(wk); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} />)}
      </div>
    );
  }
  if (error) return <p className="text-xs text-red-500">{error}</p>;

  const effMembers = effData?.members || [];
  const wkMembers = wkData || [];

  const hoursArr = effMembers.map((m) => m.actualHours || 0);
  const tasksArr = wkMembers.map((m) => m.taskCounts?.DONE || 0);

  if (!hoursArr.length && !tasksArr.length) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        No hay datos para los filtros seleccionados.
      </p>
    );
  }

  const n = Math.max(hoursArr.length, tasksArr.length);
  const avgTasks = tasksArr.length ? tasksArr.reduce((s, v) => s + v, 0) / tasksArr.length : 0;
  const avgHours = hoursArr.length ? hoursArr.reduce((s, v) => s + v, 0) / hoursArr.length : 0;
  const medTasks = median(tasksArr);
  const medHours = median(hoursArr);

  const devLabel = `${n} dev${n !== 1 ? 's' : ''}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MiniKpi label="Avg Task / Dev" value={avgTasks.toFixed(1)} sub={devLabel} />
      <MiniKpi label="Avg Hours / Dev" value={avgHours.toFixed(1)} sub={devLabel} />
      <MiniKpi label="Median Task / Dev" value={medTasks.toFixed(1)} sub="mediana tareas" />
      <MiniKpi label="Median Hours / Dev" value={medHours.toFixed(1)} sub="mediana horas" />
    </div>
  );
}
