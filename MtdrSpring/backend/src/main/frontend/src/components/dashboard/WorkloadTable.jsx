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
      <div className="flex gap-1">
        {['tasks', 'sp'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-xs px-3 py-1 rounded-lg transition-colors ${mode === m ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {m === 'tasks' ? 'Task count' : 'Story points'}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="text-left py-2 pr-3 font-medium">Member</th>
              {STATUSES.map((s) => (
                <th key={s} className="text-center py-2 px-2 font-medium whitespace-nowrap hidden sm:table-cell">
                  {s.replace('_', ' ')}
                </th>
              ))}
              <th className="text-center py-2 pl-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member, i) => (
              <tr key={member.userId} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 pr-3 font-medium text-gray-700 whitespace-nowrap">{member.fullName}</td>
                {STATUSES.map((s) => (
                  <td key={s} className="py-2 px-2 text-center text-gray-600 hidden sm:table-cell">
                    {getValue(member, s)}
                  </td>
                ))}
                <td className="py-2 pl-2 text-center font-semibold text-gray-700">{getTotal(member)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
