import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

function Skeleton() { return <div className="animate-pulse h-40 bg-gray-50 rounded-lg" />; }

export default function WorkloadTable({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('tasks');

  useEffect(() => {
    if (!sprintId) { setLoading(false); setData([]); return; }
    setLoading(true);
    dashboardService.workload(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data.length) return <p className="text-sm text-gray-400">Select a sprint to view data.</p>;

  const getValue = (member, status) =>
    mode === 'tasks'
      ? (member.taskCounts?.[status] ?? 0)
      : (member.storyPoints?.[status] ?? 0);

  const getTotal = (member) =>
    STATUSES.reduce((sum, s) => sum + getValue(member, s), 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        {['tasks', 'sp'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="text-[12px] px-3 py-1 rounded-md font-semibold transition-all"
            style={{
              background: mode === m ? 'white' : 'transparent',
              color: mode === m ? '#111827' : '#6B7280',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
            }}
          >
            {m === 'tasks' ? 'Tasks' : 'Story Points'}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
              <th className="text-left py-2 pr-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Member</th>
              {STATUSES.map((s) => (
                <th key={s} className="text-center py-2 px-2 font-bold text-gray-500 uppercase tracking-wider text-[10px] whitespace-nowrap hidden sm:table-cell">
                  {s.replace('_', ' ')}
                </th>
              ))}
              <th className="text-center py-2 pl-2 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member, i) => (
              <tr key={member.userId} style={{ borderBottom: i < data.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                <td className="py-2.5 pr-3 font-semibold text-gray-800 whitespace-nowrap">{member.fullName}</td>
                {STATUSES.map((s) => (
                  <td
                    key={s}
                    className="py-2.5 px-2 text-center hidden sm:table-cell"
                    style={{ color: s === 'BLOCKED' && getValue(member, s) > 0 ? '#C74634' : '#6B7280', fontWeight: s === 'BLOCKED' && getValue(member, s) > 0 ? 700 : 400 }}
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
