import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';
import { exportCsv } from '../../services/importExportService';
import ExportCsvButton from '../common/ExportCsvButton';

const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

function Skeleton() { return <div className="animate-pulse h-40 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />; }

export default function WorkloadTable({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('tasks');

  useEffect(() => {
    setLoading(true);
    setError('');
    dashboardService.workload(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data.length) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay datos disponibles.</p>;

  const getValue = (member, status) =>
    mode === 'tasks'
      ? (member.taskCounts?.[status] ?? 0)
      : (member.storyPoints?.[status] ?? 0);

  const getTotal = (member) =>
    STATUSES.reduce((sum, s) => sum + getValue(member, s), 0);

  const handleExport = () => {
    const rows = data.map((m) => ({
      Miembro: m.fullName,
      'Tasks TODO': m.taskCounts?.TODO ?? 0,
      'Tasks IN_PROGRESS': m.taskCounts?.IN_PROGRESS ?? 0,
      'Tasks BLOCKED': m.taskCounts?.BLOCKED ?? 0,
      'Tasks DONE': m.taskCounts?.DONE ?? 0,
      'SP TODO': m.storyPoints?.TODO ?? 0,
      'SP IN_PROGRESS': m.storyPoints?.IN_PROGRESS ?? 0,
      'SP BLOCKED': m.storyPoints?.BLOCKED ?? 0,
      'SP DONE': m.storyPoints?.DONE ?? 0,
    }));
    exportCsv(rows, sprintId ? `workload-sprint-${sprintId}` : 'workload-all-sprints');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
      <div className="flex gap-1 rounded-lg p-0.5 w-fit" style={{ background: 'var(--bg-card-alt)' }}>
        {['tasks', 'sp'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="text-[12px] px-3 py-1 rounded-md font-semibold transition-all"
            style={{
              background: mode === m ? 'var(--bg-card)' : 'transparent',
              color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
            }}
          >
            {m === 'tasks' ? 'Tasks' : 'Story Points'}
          </button>
        ))}
      </div>
      <ExportCsvButton onClick={handleExport} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: 'var(--table-alt)', borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-2 pr-3 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-secondary)' }}>Member</th>
              {STATUSES.map((s) => (
                <th key={s} className="text-center py-2 px-2 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                  {s.replace('_', ' ')}
                </th>
              ))}
              <th className="text-center py-2 pl-2 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-secondary)' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member, i) => (
              <tr key={member.userId} style={{ borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td className="py-2.5 pr-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{member.fullName}</td>
                {STATUSES.map((s) => (
                  <td
                    key={s}
                    className="py-2.5 px-2 text-center hidden sm:table-cell"
                    style={{ color: s === 'BLOCKED' && getValue(member, s) > 0 ? 'var(--status-blocked-dot)' : 'var(--text-secondary)', fontWeight: s === 'BLOCKED' && getValue(member, s) > 0 ? 700 : 400 }}
                  >
                    {getValue(member, s)}
                  </td>
                ))}
                <td className="py-2.5 pl-2 text-center font-bold text-navy">{getTotal(member)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
